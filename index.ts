// // import mongoose from "mongoose";

// // const UserSchema = new mongoose.Schema({
// //   name: String,
// //   email: { type: String, unique: true },
// //   userDocuments: {
// //     type: [String],
// //     default: [],
// //   },
// //   password: String,
// //   createdAt: { type: Date, default: Date.now },
// // });

// // const ChatSchema = new mongoose.Schema({
// //   title: String,
// //   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
// //   createdAt: { type: Date, default: Date.now },
// // });
// // export interface IMessage {
// //   content: string;
// //   role: string;
// //   chatId: mongoose.Types.ObjectId;
// //   createdAt: Date;
// //   imageData: Array<{
// //     metadata: {
// //       description?: string;
// //       title?: string;
// //       id?: string;
// //       image_path?: string;
// //     };
// //   }>;
// //   Documents: string[];
// // }
// // const MessageSchema = new mongoose.Schema({
// //   content: String,
// //   role: String,
// //   chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
// //   createdAt: { type: Date, default: Date.now },
// //   imageData: {
// //     // New field for image data
// //     type: [
// //       // Array to store multiple image objects
// //       {
// //         metadata: {
// //           // Nested object for image metadata
// //           description: { type: String },
// //           title: { type: String },
// //           id: { type: String },
// //           image_path: { type: String },
// //         },
// //       },
// //     ],
// //     default: [], // Initialize with an empty array
// //   },
// //   Documents: {
// //     type: [String],
// //     default: [],
// //   },
// // });

// // const FeedbackSchema = new mongoose.Schema({
// //   // rating: Number,
// //   // comment: String,

// //   useremail: { type: String, required: true },
// //   messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" ,required:false},
// //   feedback: {
// //     feedback: {
// //       type: String,
// //     },
    
// //     relavantAnswer: {
// //       type: String,
// //     },
   
// //   },
// //   Question:{type:String,required:true},
// //   Response:{type:String,required:true},
// //   createdAt: { type: Date, default: Date.now },
// // });

// // export const User = mongoose.models.User || mongoose.model("User", UserSchema);
// // export const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
// // export const Message =
// //   mongoose.models.Message || mongoose.model("Message", MessageSchema);
// // export const Feedback =
// //   mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);



// import mongoose from "mongoose";

// const UserSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, unique: true, required: true },
//   userDocuments: { type: [String], default: [] },
//   password: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now },
// });

// const ChatSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
//   createdAt: { type: Date, default: Date.now },
// });

// export interface IMessage {
//   content: string;
//   role: string;
//   chatId: mongoose.Types.ObjectId;
//   createdAt: Date;
//   imageData: Array<{
//     metadata: {
//       description?: string;
//       title?: string;
//       id?: string;
//       image_path?: string;
//     };
//   }>;
//   documents: string[];
// }

// const MessageSchema = new mongoose.Schema({
//   content: { type: String, required: true },
//   role: { type: String, required: true },
//   chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true, index: true },
//   createdAt: { type: Date, default: Date.now },
//   imageData: {
//     type: [
//       {
//         metadata: {
//           description: { type: String },
//           title: { type: String },
//           id: { type: String },
//           image_path: { type: String },
//         },
//       },
//     ],
//     default: [],
//   },
//   documents: { type: [String], default: [] },
// });

// const FeedbackSchema = new mongoose.Schema({
//   useremail: { type: String, required: true },
//   messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: false },
//   question: { type: String, required: true },
//   response: { type: String, required: true },
//   relevantAnswer: { type: String },
//   feedback: { type: String },
//   createdAt: { type: Date, default: Date.now },
// });

// export const User = mongoose.models.User || mongoose.model("User", UserSchema);
// export const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
// export const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);
// export const Feedback = mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  userDocuments: {
    type: [String],
    default: [],
  },
  password: String,
  createdAt: { type: Date, default: Date.now },
});

const ChatSchema = new mongoose.Schema({
  title: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});
export interface IMessage {
  content: string;
  role: string;
  chatId: mongoose.Types.ObjectId;
  createdAt: Date;
  imageData: Array<{
    metadata: {
      description?: string;
      title?: string;
      id?: string;
      image_path?: string;
    };
  }>;
  Documents: string[];
}
const MessageSchema = new mongoose.Schema({
  content: String,
  role: String,
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  createdAt: { type: Date, default: Date.now },
  imageData: {
    // New field for image data
    type: [
      // Array to store multiple image objects
      {
        metadata: {
          // Nested object for image metadata
          description: { type: String },
          title: { type: String },
          id: { type: String },
          image_path: { type: String },
        },
      },
    ],
    default: [], // Initialize with an empty array
  },
  Documents: {
    type: [String],
    default: [],
  },
});

const FeedbackSchema = new mongoose.Schema({
  // rating: Number,
  // comment: String,
  useremail: { type: String, required: true },
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  feedback: {
    feedback1: {
      type: String,
    },
 
    relaventAnswer: {
      type: String,
    },
   
  },
  question:{ type: String, required: true },
  response:{ type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
export const Message =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);
export const Feedback =
  mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);