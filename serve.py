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
import streamlit as st
from pydantic import BaseModel

loaders=PyPDFLoader('Operating Systems Course for Beginners.pdf')
docs=loaders.load()

splitter=RecursiveCharacterTextSplitter(chunk_size=1000,chunk_overlap=200)

split=splitter.split_documents(docs)

embedding=HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

vectordb=Chroma.from_documents(documents=split,embedding=embedding)

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

conversational_rag_chain.invoke(
    {"input":"My name is Tridib"},
    config={
        'configurable':{"session_id":"abc123"}

    }
)["answer"]

response=conversational_rag_chain.invoke(
    {"input":"What is my name"},
    config={
        'configurable':{"session_id":"abc123"}

    }
)["answer"]

app = FastAPI(title="RAG Chat API")

app = FastAPI(title="RAG Chat API")


class ChatRequest(BaseModel):
    session_id: str
    query: str
 

@app.post("/chat")
def chat(request: ChatRequest):
    response = conversational_rag_chain.invoke(
        {"input": request.query},
        config={
            "configurable": {"session_id": request.session_id}
        }
    )
    return {"answer": response["answer"]}


@app.get("/")
def root():
    return {"message": "RAG FastAPI server running!"}