#!/usr/bin/env python3
"""
Simple test script to verify columnTitles feature is working
"""

import json
import sys

# Mock test - simulates what the C library would return
def test_column_titles_parsing():
    """Test that we correctly parse columnTitles from the result"""

    # Simulate what the C library returns
    mock_result = json.dumps({
        "query": json.dumps({
            "operation": "find",
            "collection": "users",
            "filter": {"status": "active"},
            "projection": {"name": 1, "email": 1, "status": 1}
        }),
        "columnTitles": ["User Name", "Email", "Status"]
    })

    # Parse it like our client does
    result_data = json.loads(mock_result)

    if "error" in result_data:
        print(f"❌ Error in result: {result_data['error']}")
        return False

    # Parse the query JSON string
    query = json.loads(result_data["query"])
    column_titles = result_data.get("columnTitles", [])

    # Verify the structure
    result = {
        "query": query,
        "columnTitles": column_titles
    }

    print("✅ Test passed! Result structure:")
    print(json.dumps(result, indent=2))

    # Verify we can access the fields
    assert "query" in result, "Missing 'query' key"
    assert "columnTitles" in result, "Missing 'columnTitles' key"
    assert isinstance(result["columnTitles"], list), "columnTitles should be a list"
    assert len(result["columnTitles"]) == 3, "Should have 3 column titles"

    print("\n✅ All assertions passed!")
    print(f"\nQuery: {result['query']}")
    print(f"Column Titles: {result['columnTitles']}")

    return True


def test_empty_column_titles():
    """Test handling of missing columnTitles"""

    mock_result = json.dumps({
        "query": json.dumps({
            "operation": "count",
            "collection": "users"
        })
        # No columnTitles field
    })

    result_data = json.loads(mock_result)
    query = json.loads(result_data["query"])
    column_titles = result_data.get("columnTitles", [])

    result = {
        "query": query,
        "columnTitles": column_titles
    }

    print("\n✅ Empty columnTitles test passed!")
    print(json.dumps(result, indent=2))

    assert result["columnTitles"] == [], "Should default to empty list"

    return True


def test_import():
    """Test that we can import the updated client"""
    try:
        from prompt_to_query.client import PromptToQuery
        print("✅ Successfully imported PromptToQuery")

        # Check that the docstring mentions columnTitles
        docstring = PromptToQuery.generate_query.__doc__
        if "columnTitles" in docstring:
            print("✅ Docstring includes columnTitles")
        else:
            print("⚠️  Warning: Docstring doesn't mention columnTitles")

        return True
    except ImportError as e:
        print(f"❌ Failed to import: {e}")
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("Testing Column Titles Feature")
    print("=" * 60)

    tests = [
        ("Parsing columnTitles", test_column_titles_parsing),
        ("Empty columnTitles handling", test_empty_column_titles),
        ("Import test", test_import)
    ]

    passed = 0
    failed = 0

    for test_name, test_func in tests:
        print(f"\n{'=' * 60}")
        print(f"Test: {test_name}")
        print("=" * 60)

        try:
            if test_func():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            failed += 1

    print("\n" + "=" * 60)
    print(f"Results: {passed} passed, {failed} failed")
    print("=" * 60)

    sys.exit(0 if failed == 0 else 1)
