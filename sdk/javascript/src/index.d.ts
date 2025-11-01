/**
 * Database schema structure
 */
export interface DatabaseSchema {
  [collectionName: string]: {
    fields: {
      [fieldName: string]: string;
    };
  };
}

/**
 * Configuration for PromptToQuery client
 */
export interface PromptToQueryConfig {
  /**
   * LLM provider ("openai" or "anthropic")
   * @example "openai"
   */
  llmProvider: 'openai' | 'anthropic';

  /**
   * API key for the LLM provider
   * @example "sk-..."
   */
  apiKey: string;

  /**
   * Database schema as an object
   * Either dbSchema or dbSchemaPath must be provided
   */
  dbSchema?: DatabaseSchema;

  /**
   * Path to JSON file containing database schema
   * Either dbSchema or dbSchemaPath must be provided
   * @example "./schema.json"
   */
  dbSchemaPath?: string;

  /**
   * Specific model to use (optional)
   * OpenAI: "gpt-4", "gpt-4-turbo-preview", "gpt-3.5-turbo"
   * Anthropic: "claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"
   */
  model?: string;

  /**
   * Custom path to the shared library (optional)
   * @example "/path/to/libprompttoquery.so"
   */
  libPath?: string;
}

/**
 * MongoDB query result
 */
export interface MongoQuery {
  /**
   * Operation type
   * @example "find"
   */
  operation: 'find' | 'aggregate' | 'count';

  /**
   * Collection name
   * @example "users"
   */
  collection: string;

  /**
   * Query filter (for find/count operations)
   * @example { status: "active" }
   */
  filter?: Record<string, any>;

  /**
   * Aggregation pipeline (for aggregate operations)
   * @example [{ $match: { status: "active" } }, { $sort: { created_at: -1 } }]
   */
  pipeline?: Array<Record<string, any>>;

  /**
   * Field projection
   * @example { name: 1, email: 1 }
   */
  projection?: Record<string, 1 | 0>;

  /**
   * Sort specification
   * @example { created_at: -1 }
   */
  sort?: Record<string, 1 | -1>;

  /**
   * Limit number of results
   * @example 10
   */
  limit?: number;

  /**
   * Skip number of results
   * @example 20
   */
  skip?: number;
}

/**
 * Query result with column titles
 */
export interface QueryResult {
  /**
   * Generated MongoDB query
   */
  query: MongoQuery;

  /**
   * Human-readable column titles for the data that will be returned
   * @example ["User Name", "Email", "Status", "Created At"]
   */
  columnTitles: string[];
}

/**
 * Error class for PromptToQuery SDK
 */
export class PromptToQueryError extends Error {
  constructor(message: string);
}

/**
 * Main SDK client for converting prompts to MongoDB queries
 *
 * @example
 * ```typescript
 * const ptq = new PromptToQuery({
 *   llmProvider: 'openai',
 *   apiKey: 'sk-...',
 *   dbSchemaPath: './schema.json'
 * });
 *
 * const query = await ptq.generateQuery('Get all active users');
 * console.log(query);
 * ```
 */
export class PromptToQuery {
  /**
   * Create a PromptToQuery client
   *
   * @param config - Configuration object
   * @throws {PromptToQueryError} If initialization fails
   * @throws {Error} If neither dbSchema nor dbSchemaPath is provided
   *
   * @example
   * ```typescript
   * const ptq = new PromptToQuery({
   *   llmProvider: 'openai',
   *   apiKey: process.env.OPENAI_API_KEY,
   *   dbSchemaPath: './schema.json'
   * });
   * ```
   */
  constructor(config: PromptToQueryConfig);

  /**
   * Generate a MongoDB query from a natural language prompt
   *
   * @param prompt - Natural language description of the desired query
   * @returns Promise resolving to query result with MongoDB query and column titles
   * @throws {PromptToQueryError} If query generation fails
   *
   * @example
   * ```typescript
   * const result = await ptq.generateQuery('Get top 10 products by price');
   * console.log(result.query);
   * // { operation: 'find', collection: 'products', sort: { price: -1 }, limit: 10 }
   * console.log(result.columnTitles);
   * // ['Product Name', 'Price', 'Category', 'Stock']
   * ```
   */
  generateQuery(prompt: string): Promise<QueryResult>;

  /**
   * Get the SDK version
   *
   * @returns Version string
   *
   * @example
   * ```typescript
   * const version = ptq.getVersion();
   * console.log(version); // "1.0.0"
   * ```
   */
  getVersion(): string;
}

/**
 * Named exports
 */
export { PromptToQuery, PromptToQueryError, PromptToQueryConfig, DatabaseSchema, MongoQuery, QueryResult };

/**
 * Default export
 */
export default PromptToQuery;
