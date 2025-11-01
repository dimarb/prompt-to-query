#!/usr/bin/env python3
"""
Example usage of the PromptToQuery SDK for Python
"""

import os
import sys
import json
from pathlib import Path

# Add the SDK to the path
sdk_path = Path(__file__).parent.parent.parent / "sdk" / "python"
sys.path.insert(0, str(sdk_path))

from prompt_to_query import PromptToQuery, PromptToQueryError


def main():
    # Check for API key
    api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: Please set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable")
        sys.exit(1)

    # Determine which provider to use
    llm_provider = "openai" if os.environ.get("OPENAI_API_KEY") else "anthropic"

    # Path to schema
    schema_path = Path(__file__).parent.parent / "schema.json"

    print(f"Initializing PromptToQuery with {llm_provider}...")

    try:
        # Initialize the SDK
        ptq = PromptToQuery(
            llm_provider=llm_provider,
            api_key=api_key,
            db_schema_path=str(schema_path)
        )

        print(f"SDK Version: {ptq.get_version()}\n")

        # Example queries
        prompts = [
            "Get all active users",
            "Find products with price greater than 100 dollars",
            "Count orders from last month",
            "Get top 10 products by sales with their categories",
            "Find users who logged in during the last 7 days",
            "Get all orders with status 'delivered' sorted by date descending",
        ]

        for i, prompt in enumerate(prompts, 1):
            print(f"{i}. Prompt: {prompt}")
            try:
                query = ptq.generate_query(prompt)
                print(f"   Query: {json.dumps(query, indent=2)}\n")
            except PromptToQueryError as e:
                print(f"   Error: {e}\n")

    except PromptToQueryError as e:
        print(f"Initialization failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
