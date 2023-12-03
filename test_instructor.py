import instructor
from openai import OpenAI
from pydantic import BaseModel

# Apply the patch to the OpenAI client
client = instructor.patch(OpenAI())

# Define the Pydantic Model
class UserDetails(BaseModel):
    name: str
    age: int

# Extract data
user: UserDetails = client.chat.completions.create(
    model="gpt-3.5-turbo",
    response_model=UserDetails,
    messages=[
        {"role": "user", "content": "Extract Jason is 25 years old"},
    ]
)

# Assertions
assert user.name == "Jason"
assert user.age == 25