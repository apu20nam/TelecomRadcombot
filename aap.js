sync function generate(state, config) {
    console.log("---GENERATE---");
    const question = state.question;
    const documents = state.documents;
    console.log(documents.length);
    const systemPrompt = `
You are a telecom network expert. Answer using only the provided context.

- Respond in bullet points.
- Do NOT add any external knowledge or assumptions.
- ONLY answer if the question is telecom-related.
- If the context is not enough, respond with:
  - "I don't have idea about this."

Be precise, structured, and context-only. Never mix valid answers with fallback responses.
`;
    const model_name = "llama3.2:3b";
    let streamedResponse = "";
    const stream = new ChatOllama({
        model: model_name,
        temperature: 0,
        streaming: true,
        callbacks: [
            {
                handleLLMNewToken(token) {
                    streamedResponse += token;
                    if (config && config.configurable && config.configurable.streamCallback) {
                        config.configurable.streamCallback(token);
                    }
                },
            },
        ],
    });
    const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(`context: ${documents}\n\nquestion:\n${question}`)
    ];
    // Invoke LLM with streaming
    await stream.invoke(messages);
    console.log(`image from generate is ${state.rel_image}`);
    return {
        chat_history: state.chat_history + `question is ${question} \n Answer for it is : ${streamedResponse} \n\n`,
        documents: documents,
        question: question,
        generation: streamedResponse,
        rel_image: state.rel_image,
        source_info: state.source_info
    };
}
async function Internal(state, config) {
    console.log("---Internal Knowledge---");
    const question = state.question;
    const documents = state.documents;
    const systemPrompt = `
    You are a telecom expert specializing in 3G, 4G, 5G, and emerging technologies. Your task is to provide precise and accurate answers to telecom network, standards, and quality assurance queries.
    
    Rules:  
    1. **Confident Responses Only:** Answer only if certain of accuracy.  
    2. **Reference Standards:** When applicable, cite relevant 3GPP or telecom documents (e.g., TS 23.501) with document number, title, and specific sections.  
    3. **No Guessing:** If unsure, respond with "I don't know the answer."  
    4. **Concise and Structured:** Deliver clear, professional, and to-the-point responses. Avoid unnecessary details.  


    If you are Not Confident then DIRECTLY SAY I DONT KNOW THE ANSWER.
    `;
    const model_name = "llama3.2:3b";
    const stream = new ChatOllama({
        model: model_name,
        temperature: 0,
        streaming: true,
        callbacks: [
            {
                handleLLMNewToken(token) {
                    if (config && config.configurable && config.configurable.streamCallback) {
                        config.configurable.streamCallback(token);
                    }
                },
            }
        ]
    });
    const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(`context: ${documents}\n\nquestion:\n${question}`)
    ];
    try {
        const response = await stream.invoke(messages);
        const llmResults = response.content;
        return {
            generation: llmResults,
            source_info: state.source_info,
            rel_image: state.rel_image
        };
    }
    catch (error) {
        console.error("Error during LLM invocation:", error);
        throw new Error("Failed to perform web search.");
    }
}
async function isTelecom(state) {
    const query = state.question;
    console.log(`query is in IsTelecom ${query}`);
    console.log("---General Query----");
    // Assuming general() is a function that returns a response, e.g., "yes" or "no"
    const telecomAnswer = await general(query); // Make sure general is async if it involves an API or async action.
    return {
        Tele: telecomAnswer
    };
}
function decideToGenerate_2(state) {
    console.log("---ASSESS GRADED DOCUMENTS---");
    const tele = state.Tele;
    console.log(`"---running decide2generate---${tele}"`);
    console.log(`"---running decide2generate---${tele.toString()}"`);
    if (tele.toString() == "yes") {
        console.log("---rephrase query called---");
        return "retrieve";
    }
    else {
        console.log("---DECISION: General Query---");
        return "GeneralResponse";
    }
}
function decideToGenerate(state) {
    console.log("---ASSESS GRADED DOCUMENTS---");
    const webSearch = state.web_search;
    if (webSearch === "yes") {
        console.log("---DECISION: Internal node called---");
        return "Internal";
    }
    else {
        console.log("---DECISION: GENERATE---");
        return "generate";
    }
}
// Workflow definition
const workflow = new StateGraph(GraphState)
    // .addNode("Contextualize_query", rephrasedQuery)
    .addNode("General_Query", isTelecom)
    .addNode("general_response", GeneralResponse)
    .addNode("retrieve", retrieve)
    .addNode("gradeDocuments", gradeDocuments)
    .addNode("generate", generate)
    .addNode("Internal_Knowledge", Internal);
workflow.addEdge(START, "General_Query");
// workflow.addEdge("Contextualize_query", "General_Query");
workflow.addEdge("retrieve", "gradeDocuments");
workflow.addEdge("General_Query", "general_response"); // Direct flow to general_response for general queries
// Conditional edges for specific flows
workflow.addConditionalEdges("General_Query", decideToGenerate_2, {
    retrieve: "retrieve",
    GeneralResponse: "general_response", // If it's a general query, directly go to general_response
});
// Conditional edges for gradeDocuments
workflow.addConditionalEdges("gradeDocuments", decideToGenerate, {
    Internal: "Internal_Knowledge",
    generate: "generate",
});
// End nodes
workflow.addEdge("general_response", END);
workflow.addEdge("Internal_Knowledge", END);
workflow.addEdge("generate", END);
const memory = new MemorySaver();
const app = workflow.compile({ checkpointer: memory });
// Class definition to classify if a question is telecom-related
class GeneralQuestion {
    binary_score;
    constructor(binary_score) {
        this.binary_score = binary_score;
    }
}
// Function to classify and answer questions
async function general(query) {
    const generalModel = new ChatOllama({ model: "llama3.2:3b", temperature: 0 });
    const systemPrompt = `
  You are an AI that determines whether a given query is related to telecommunications (TEPCLM). 
  Analyze the query and respond strictly with 'Yes' if it is telecom-related and 'No' otherwise. 
  Do not provide explanations or additional text.

  ###Example Input :
   query:what is AI/ML?
   response: No  (it is general Query)

   query :Hello
   response : No

   query : Hi or HII or hii
   response: No

   query: Hello ,what is 5G?
   response: Yes
    
   query: what is ml?
   response: No
 
   query: can u elaborate more?
   response: Yes

   query:can you explain again
   response: Yes

   query : give me example of it:
   response : Yes

   query : can u describe that term?
   response: Yes
  `;
    try {
        const messages = [
            new SystemMessage(systemPrompt),
            new HumanMessage(`question: ${query}`)
        ];
        // Invoke the LLM to classify the question
        const aiResponse = await generalModel.invoke(messages);
        const aiResponseContent = aiResponse.content.toString().trim().toLowerCase();
        // Instantiate GeneralQuestion with the LLM response
        const evaluation = new GeneralQuestion(aiResponseContent);
        console.log(`the general function is ${evaluation.binary_score}`);
        return evaluation.binary_score;
    }
    catch (error) {
        console.error("Error in generalQA function:", error);
        return "Could not classify the response. Check LLM output.";
    }
}
async function GeneralResponse(state, config) {
    const assistant = `You are TeleBot, a Telecom Network Engineer . Respond to user queries directly, providing clear and accurate answers without unnecessary explanations
   .`;
    const stream = new ChatOllama({
        model: model_name,
        temperature: 0,
        streaming: true,
        callbacks: [
            {
                handleLLMNewToken(token) {
                    if (config && config.configurable && config.configurable.streamCallback) {
                        config.configurable.streamCallback(token);
                    }
                },
            }
        ]
    });
    console.log('---General Question------');
    const query = state.question;
    const messages = [
        new SystemMessage(assistant),
        new HumanMessage(`question: ${query}`)
    ];
    try {
        // Invoke the LLM for the direct answer
        const res = await stream.invoke(messages);
        const response = res.content.toString().trim();
        return {
            generation: response, rel_image: [], source_info: []
        };
    }
    catch (error) {
        console.error("Error while generating response:", error);
        return {
            generation: "Sorry, I couldn't generate an answer. Please try again later.", rel_image: [], source_info: []
        };
    }
}
async function standaloneQuery(chatHistory, currentQuery) {
    const query = chatHistory ? `${chatHistory}\n${currentQuery}` : currentQuery;
    const systemPrompt = `You are an AI assistant. Your task is to ensure that user queries are self-contained and do not rely on previous chat history.

### **Instructions:**
1. **Check if the latest user query is already self-contained** (i.e., it does not rely on past exchanges and is understandable on its own).  
   - If it is **self-contained and different** from the last user query, return it **as is**.  
   - If it is **dependent on previous context**, rephrase it into a **standalone query** using chatHistory and the last user question.  
   
2. **If the latest user query is a greeting** (e.g., "hello", "hi", "how are you"), return it **exactly as it is**, without modification.

3. **Do not modify or add unnecessary information** to queries that are already self-contained.

### **Example Behavior:**
#### **Case 1: Dependent Query (Rephrase Needed)**
**Chat History:**  
User: What is GTPC?  
Assistant: GTPC stands for GPRS Tunneling Protocol Control, used for signaling in mobile networks.  
**Current Query:** How does it work?  
**Reformulated Query:** How does GPRS Tunneling Protocol Control (GTPC) work?

#### **Case 2: Self-contained but Different Query (Return As Is)**
**Chat History:**  
User: What is GTPC?  
Assistant: GTPC stands for GPRS Tunneling Protocol Control, used for signaling in mobile networks.  
**Current Query:** What are LTE network components?  
**Reformulated Query:** What are LTE network components?

#### **Case 3: Self-contained Query (Return As Is)**
**Chat History:** (empty)  
**Current Query:** What is machine learning?  
**Reformulated Query:** What is machine learning?  
**Current Query:** What are the types of machine learning?  
**Reformulated Query:** What are the types of machine learning?

#### **Case 4: Greetings (Return As Is)**
**Chat History:** (any)  
**Current Query:** hello  
**Reformulated Query:** hello  
**Current Query:** hi  
**Reformulated Query:** hi  
**Current Query:** how are you?  
**Reformulated Query:** how are you?  

### **Output Format:**  
{ "reformulated_query": "<final_standalone_question>" }
`;
    try {
        const llm = new ChatOllama({
            model: "llama3.2:3b",
            temperature: 0,
        });
        const response = await llm.invoke([
            new SystemMessage(systemPrompt),
            new HumanMessage(`chat history is:\n${query}`)
        ]);
        const content = response.content?.toString() || "";
        const reformulatedQuery = content.match(/"reformulated_query":\s*"([^"]+)"/)?.[1] || currentQuery;
        console.log(`Reformulated query: ${reformulatedQuery}`);
        return reformulatedQuery;
    }
    catch (error) {
        console.error("Error rephrasing query:", error);
        return currentQuery;
    }
}
async function runGraph(query, id, streamCallback) {
    const config = {
        configurable: { thread_id: id, streamCallback },
    };
    try {
        console.log(`id is ${id}`);
        const memoryState = await app.getState(config);
        console.log(`State is : ${JSON.stringify(memoryState)}`);
        const result = await app.invoke({ question: query }, config);
        const marker = "**Answer:**";
        const answerStartIndex = result.generation.indexOf(marker);
        let response;
        if (answerStartIndex !== -1) {
            response = result.generation.substring(answerStartIndex + marker.length).trim();
        }
        else {
            response = result.generation;
        }
        // Stream the data back to frontend
        streamCallback(response, result.source_info, result.rel_image, true); // Mark as done after streaming
        console.log(`here just after streamCallback`);
        return {
            response: response,
            source: result.source_info,
            image: result.rel_image,
        };
    }
    catch (error) {
        console.error("Error in runGraph function:", error);
        throw new Error("Failed to execute runGraph.");
    }
}
const app_1 = express();
app_1.use(express.json());
app_1.use(cors({
    origin: "*",
}));
function getLastExchanges(chatHistory, exchangesCount = 3) {
    if (!chatHistory || chatHistory.length === 0)
        return ""; // Handle empty history
    const totalEntries = chatHistory.length;
    const maxEntries = exchangesCount * 2; // User-Assistant pairs
    // If less than two exchanges exist, take the entire chat history
    const startIndex = totalEntries < 4 ? 0 : Math.max(0, totalEntries - maxEntries);
    let formattedExchanges = [];
    for (let i = startIndex; i < totalEntries; i += 2) {
        const userQuery = chatHistory[i]?.replace(/^user:\s*/, "") || "";
        const assistantResponse = chatHistory[i + 1]?.replace(/^assistant:\s*/, "") || "No response";
        formattedExchanges.push(`Query: ${userQuery}\nResponse: ${assistantResponse}`);
    }
    return formattedExchanges.join("\n\n");
}
app_1.post("/api/query1", async (req, res) => {
    const { query, chat_history } = req.body;
    console.log(req.body);
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    const history = getLastExchanges(chat_history);
    console.log(`history is ${history}`);
    const new_query = await standaloneQuery(history, query);
    console.log(`the new rephrase: ${new_query}`);
    try {
        const encoder = new TextEncoder();
        let documents = [];
        let allImageData = [];
        const id = "2"; // ID set for some context
        // Call the function and handle data streaming
        await runGraph(new_query, id, (token, sourceInfo, image, done) => {
            const result = { token, source_info: sourceInfo, rel_image: image };
            documents = [...new Set(sourceInfo)];
            if (image && Array.isArray(image)) {
                image.forEach((img) => {
                    if (img) {
                        const imageData = {
                            metadata: {
                                description: "Diagram",
                                title: "",
                                id: id,
                                image_path: img // No need for `|| null` since we skip invalid values
                            }
                        };
                        allImageData.push(imageData);
                    }
                });
            }
            // Stream intermediate responses
            res.write(encoder.encode(`data: ${JSON.stringify(result)}\n\n`));
            if (done) {
                console.log("Streaming done, sending final response.");
                res.write(`data: ${JSON.stringify({
                    documents,
                    imageData: allImageData,
                    done: true,
                })}\n\n`);
                res.end();
            }
        });
    }
    catch (error) {
        console.error("Error in /api/query1:", error);
        res.write(`data: ${JSON.stringify({ error: "Failed to process the query." })}\n\n`);
        res.end(); // Ensure the connection is closed in case of an error
    }
});
app_1.listen(4002, () => {
    console.log("Server is running on port 4002");
});