# server-kbx

## Transcript

upload mp3 file or get the URL and add to data/meta/allMeta.yaml with a unique cname

add any unique names to the 'replacers' to the BasicReplacers file.

```
just transStart $CNAME
# wait 20 mins
just transFetch $CNAME
just chunk $CNAME

# check the chunks in data/chunked/$CNAME - if needed and run a clean script again:
# just clean-chunked $CNAME

# load into DB
just loadStory $CNAME


```


## Knowledge Graph

https://jimruttshow.blubrry.net/the-jim-rutt-show-transcripts/transcript-of-episode-139-robert-tercek-on-education-today/
https://console.cloud.google.com/speech/transcriptions/list?hl=en&project=kbxt-404306

https://github.com/yoheinakajima/instagraph/pull/38/files

```
 completion = openai.ChatCompletion.create(
        completion: KnowledgeGraph = openai.ChatCompletion.create(
            model="gpt-3.5-turbo-16k",
            messages=[
                {
                    "role": "user",
                    "content": f"Help me understand following by describing as a detailed knowledge graph: {user_input}",
                }
            ],
            functions=[
                {
                    "name": "knowledge_graph",
                    "description": "Generate a knowledge graph with entities and relationships. Use the colors to help differentiate between different node or edge types/categories. Always provide light pastel colors that work well with black font.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "metadata": {
                                "type": "object",
                                "properties": {
                                    "createdDate": {"type": "string"},
                                    "lastUpdated": {"type": "string"},
                                    "description": {"type": "string"},
                                },
                            },
                            "nodes": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "id": {"type": "string"},
                                        "label": {"type": "string"},
                                        "type": {"type": "string"},
                                        # Added color property
                                        "color": {"type": "string"},
                                        "properties": {
                                            "type": "object",
                                            "description": "Additional attributes for the node",
                                        },
                                    },
                                    "required": [
                                        "id",
                                        "label",
                                        "type",
                                        "color",
                                    ],  # Added color to required
                                },
                            },
                            "edges": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "from": {"type": "string"},
                                        "to": {"type": "string"},
                                        "relationship": {"type": "string"},
                                        "direction": {"type": "string"},
                                        # Added color property
                                        "color": {"type": "string"},
                                        "properties": {
                                            "type": "object",
                                            "description": "Additional attributes for the edge",
                                        },
                                    },
                                    "required": [
                                        "from",
                                        "to",
                                        "relationship",
                                        "color",
                                    ],  # Added color to required
                                },
                            },
                        },
                        "required": ["nodes", "edges"],
                    },
                }
            ],
            function_call={"name": "knowledge_graph"},
        )
            response_model=KnowledgeGraph,
        ) # type: ignore

```