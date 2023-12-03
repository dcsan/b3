from llama_index import StorageContext, load_index_from_storage

def chat_with_openai_index(query):
    # Rebuild storage context
    storage_context = StorageContext.from_defaults(persist_dir="personal_index")

    # Load index from the storage context
    index = load_index_from_storage(storage_context)

    # Create a chat engine with OpenAI mode
    chat_engine = index.as_chat_engine(chat_mode="openai")

    # Chat with the engine
    response = chat_engine.chat(query)

    return response

response = chat_with_openai_index("What is this text about?")
print(response)
## Broken
