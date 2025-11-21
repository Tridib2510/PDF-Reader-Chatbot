import os
from dotenv import load_dotenv
load_dotenv()
from langchain_groq import ChatGroq
groq_api_key=os.getenv("GROQ_API_KEY")
from fastapi import FastAPI
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import tempfile
from fastapi import UploadFile, File, Form


embedding=HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

vectordb=Chroma(
         collection_name=id,
         embedding_function=embedding,
         persist_directory="chroma_db"
   )

retriever=vectordb.as_retriever()

llm=ChatGroq(groq_api_key=groq_api_key,model_name="llama-3.1-8b-instant")

from langchain_classic.chains import create_retrieval_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import MessagesPlaceholder

system_prompt=(
    "You are an assistant for question answer"
    "Use the following pieces of retrieved context to answer"
    "the question. If you don't know the answer,say thay you"
    "don't know . Use three sentences maximum and keep the"
    "answer concise"
    "\n\n"
    "{context}"
    
)

qa_prompt=ChatPromptTemplate.from_messages(
    [
        ("system",system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human","{input}")
    ]
)

document_chain=create_stuff_documents_chain(llm,qa_prompt)

rag_chain=create_retrieval_chain(retriever,document_chain)

from langchain_classic.chains import create_history_aware_retriever
from langchain_core.prompts import MessagesPlaceholder

contextualize_q_system_prompt=(
    "Given a chat history and the latest user question"
    "which might reference context in the chat history"
    "formulate a standalone question which can be understood"
    "without the chat history. Do NOT answer the question"
    "just reformulate it if needed and otherwise return it as is."
)


contextualize_q_prompts=ChatPromptTemplate.from_messages(
    [
        ("system",contextualize_q_system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human","{input}")
    ]
)

history_aware_retriever=create_history_aware_retriever(llm,retriever,contextualize_q_prompts)

question_answer_chain=create_stuff_documents_chain(llm,qa_prompt)

rag_chain=create_retrieval_chain(history_aware_retriever,question_answer_chain)

from langchain_community import chat_message_histories
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory

store={}

def get_history(id:str)->BaseChatMessageHistory:
  if id not in store:
    store[id]=ChatMessageHistory()

  return store[id]

conversational_rag_chain=RunnableWithMessageHistory(
    rag_chain,
    get_history,
    input_messages_key="input",
    history_messages_key="chat_history",
    output_messages_key="answer"
)

response=conversational_rag_chain.invoke(
    {"input":"What is my name"},
    config={
        'configurable':{"session_id":"abc123"}

    }
)["answer"]

app = FastAPI(title="RAG Chat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    
    session_id: str
    query: str

@app.post("/load_pdf")
async def load_pdf(
    id :str,
    pdf: UploadFile = File(...)
   

):
   with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
         temp_pdf.write(await pdf.read())
         file_path = temp_pdf.name

   print(f"Loading PDF from path: {file_path}")
   loaders = PyPDFLoader(file_path)
   docs = loaders.load()
   split=splitter.split_documents(docs)
   client = Chroma(persist_directory="chroma_db")
   existing = client._client.list_collections()

    # Remove if exists
   if any(c.name == id for c in existing):
        print("Collection exists — deleting")
        client._client.delete_collection(name=id)
        
   vectordb=Chroma(
         collection_name=id,
         embedding_function=embedding,
         persist_directory="chroma_db"
   )
   vectordb.add_documents(split)
   return "Request successfully processed."

def create_retrieval_chain_endpoint(retriever: Chroma):
    history_aware_retriever= create_history_aware_retriever(llm,retriever,contextualize_q_prompts)
    question_answer_chain=create_stuff_documents_chain(llm,qa_prompt)
    rag_chain=create_retrieval_chain(history_aware_retriever,question_answer_chain)
    conversational_rag_chain=RunnableWithMessageHistory(
    rag_chain,
    get_history,
    input_messages_key="input",
    history_messages_key="chat_history",
    output_messages_key="answer"
)
    return conversational_rag_chain
    

@app.post("/chat")
def chat(
    user_id:str,
    request: ChatRequest):
    vectordb = Chroma(
        collection_name=user_id,
        embedding_function=embedding,
        persist_directory="chroma_db"
    )
    retriever=vectordb.as_retriever()
    conversational_rag_chain= create_retrieval_chain_endpoint(retriever)
    response =  conversational_rag_chain.invoke(
        {"input": request.query},
        config={
            "configurable": {"session_id": request.session_id}
        }
    )
    return {"answer": response["answer"]}


@app.get("/")
def root():
    return {"message": "RAG FastAPI server running!"} 