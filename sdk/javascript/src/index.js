const koffi = require('koffi');
const path = require('path');
const fs = require('fs');
const os = require('os');

/**
 * Error class for PromptToQuery SDK
 */
class PromptToQueryError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PromptToQueryError';
  }
}

/**
 * Main SDK client for converting prompts to MongoDB queries
 */
class PromptToQuery {
  /**
   * Create a PromptToQuery client
   *
   * @param {Object} config - Configuration object
   * @param {string} config.llmProvider - LLM provider ("openai" or "anthropic")
   * @param {string} config.apiKey - API key for the LLM provider
   * @param {Object} [config.dbSchema] - Database schema as an object
   * @param {string} [config.dbSchemaPath] - Path to JSON file containing database schema
   * @param {string} [config.model] - Specific model to use (optional)
   * @param {string} [config.libPath] - Custom path to the shared library (optional)
   *
   * @throws {PromptToQueryError} If initialization fails
   * @throws {Error} If neither dbSchema nor dbSchemaPath is provided
   *
   * @example
   * const ptq = new PromptToQuery({
   *   llmProvider: 'openai',
   *   apiKey: 'sk-...',
   *   dbSchemaPath: 'schema.json'
   * });
   */
  constructor(config) {
    const {
      llmProvider,
      apiKey,
      dbSchema,
      dbSchemaPath,
      model,
      libPath
    } = config;

    if (!dbSchema && !dbSchemaPath) {
      throw new Error('Either dbSchema or dbSchemaPath must be provided');
    }

    // Load schema from file if path is provided
    let schemaObj = dbSchema;
    if (dbSchemaPath) {
      const schemaContent = fs.readFileSync(dbSchemaPath, 'utf-8');
      schemaObj = JSON.parse(schemaContent);
    }

    // Load the shared library
    this.lib = this._loadLibrary(libPath);

    // Initialize the SDK
    const initConfig = {
      llm_provider: llmProvider,
      api_key: apiKey,
      db_schema: JSON.stringify(schemaObj)
    };

    if (model) {
      initConfig.model = model;
    }

    const configJson = JSON.stringify(initConfig);
    const result = this.lib.InitSDK(configJson);

    // result is already a JavaScript string with koffi
    const resultData = JSON.parse(result);

    if (resultData.error) {
      throw new PromptToQueryError(`Initialization failed: ${resultData.error}`);
    }
  }

  /**
   * Detect if running on Alpine Linux (musl libc)
   * @private
   */
  _isAlpine() {
    // First try the most reliable method: check for alpine-release file
    try {
      fs.accessSync('/etc/alpine-release');
      return true;
    } catch (e) {
      // Fallback: check if musl libc is present via ldd
      try {
        const { execSync } = require('child_process');
        const lddOutput = execSync('ldd --version 2>&1', { encoding: 'utf8', timeout: 1000 });
        return lddOutput.toLowerCase().includes('musl');
      } catch (e2) {
        // If both methods fail, assume glibc (standard Linux)
        return false;
      }
    }
  }

  /**
   * Load the shared library based on the platform
   * @private
   */
  _loadLibrary(customPath) {
    if (customPath) {
      return this._createFFI(customPath);
    }

    // Determine library name based on platform
    const platform = os.platform();
    const arch = os.arch();
    const isAlpine = platform === 'linux' ? this._isAlpine() : false;

    // Search paths in order of priority:
    // 1. lib/ directory (for npm package distribution)
    // 2. core/build/ directory (for development in monorepo)
    const searchDirs = [
      path.join(__dirname, '..', 'lib'),
      path.join(__dirname, '..', '..', '..', 'core', 'build')
    ];

    // Determine possible library names based on platform
    let libNames = [];

    if (platform === 'linux') {
      if (arch === 'x64') {
        if (isAlpine) {
          // Alpine uses musl libc - try musl version first, fallback to glibc
          libNames = ['libprompttoquery_linux_amd64_musl.so', 'libprompttoquery_linux_amd64.so', 'libprompttoquery.so'];
        } else {
          // Standard Linux uses glibc
          libNames = ['libprompttoquery_linux_amd64.so', 'libprompttoquery.so'];
        }
      } else if (arch === 'arm64') {
        if (isAlpine) {
          // Alpine uses musl libc - try musl version first, fallback to glibc
          libNames = ['libprompttoquery_linux_arm64_musl.so', 'libprompttoquery_linux_arm64.so', 'libprompttoquery.so'];
        } else {
          // Standard Linux uses glibc
          libNames = ['libprompttoquery_linux_arm64.so', 'libprompttoquery.so'];
        }
      } else {
        libNames = ['libprompttoquery.so'];
      }
    } else if (platform === 'darwin') {
      if (arch === 'x64') {
        libNames = ['libprompttoquery_darwin_amd64.dylib', 'libprompttoquery.dylib'];
      } else if (arch === 'arm64') {
        libNames = ['libprompttoquery_darwin_arm64.dylib', 'libprompttoquery.dylib'];
      } else {
        libNames = ['libprompttoquery.dylib'];
      }
    } else if (platform === 'win32') {
      if (arch === 'x64') {
        libNames = ['prompttoquery_windows_amd64.dll', 'prompttoquery.dll'];
      } else if (arch === 'arm64') {
        libNames = ['prompttoquery_windows_arm64.dll', 'prompttoquery.dll'];
      } else {
        libNames = ['prompttoquery.dll'];
      }
    } else {
      throw new PromptToQueryError(`Unsupported platform: ${platform}`);
    }

    // Search for library in all directories and names
    for (const dir of searchDirs) {
      for (const libName of libNames) {
        const libPath = path.join(dir, libName);
        if (fs.existsSync(libPath)) {
          return this._createFFI(libPath);
        }
      }
    }

    // If not found, throw error with helpful message
    const searchedPaths = searchDirs.map(dir =>
      libNames.map(name => path.join(dir, name))
    ).flat();

    throw new PromptToQueryError(
      `Native library not found. Searched in:\n` +
      searchedPaths.map(p => `  - ${p}`).join('\n') + '\n\n' +
      `Platform: ${platform}, Architecture: ${arch}\n` +
      `Please ensure the library is built or included in the package.`
    );
  }

  /**
   * Create FFI interface for the library
   * @private
   */
  _createFFI(libPath) {
    const lib = koffi.load(libPath);

    // Define C functions with koffi
    const InitSDK = lib.func('InitSDK', 'string', ['string']);
    const GenerateQuery = lib.func('GenerateQuery', 'string', ['string']);
    const GetVersion = lib.func('GetVersion', 'string', []);

    return {
      InitSDK,
      GenerateQuery,
      GetVersion
    };
  }

  /**
   * Generate a MongoDB query from a natural language prompt
   *
   * @param {string} prompt - Natural language description of the desired query
   * @returns {Promise<Object>} Object containing:
   *   - query: MongoDB query object with keys like:
   *     - operation: "find", "aggregate", or "count"
   *     - collection: Name of the collection
   *     - filter: Query filter (for find/count)
   *     - pipeline: Aggregation pipeline (for aggregate)
   *     - projection, sort, limit, skip: Optional parameters
   *   - columnTitles: Array of human-readable column titles for the returned data
   *
   * @throws {PromptToQueryError} If query generation fails
   *
   * @example
   * const result = await ptq.generateQuery('Get top 10 products by price');
   * console.log(result.query);
   * // { operation: 'find', collection: 'products', sort: { price: -1 }, limit: 10 }
   * console.log(result.columnTitles);
   * // ['Product Name', 'Price', 'Category', 'Stock']
   */
  async generateQuery(prompt) {
    return new Promise((resolve, reject) => {
      try {
        const result = this.lib.GenerateQuery(prompt);
        // result is already a JavaScript string with koffi
        const resultData = JSON.parse(result);

        if (resultData.error) {
          reject(new PromptToQueryError(`Query generation failed: ${resultData.error}`));
          return;
        }

        // Parse the query JSON string
        const query = JSON.parse(resultData.query);
        const columnTitles = resultData.columnTitles || [];

        resolve({
          query,
          columnTitles
        });
      } catch (error) {
        reject(new PromptToQueryError(`Query generation failed: ${error.message}`));
      }
    });
  }

  /**
   * Get the SDK version
   * @returns {string} Version string
   */
  getVersion() {
    // result is already a JavaScript string with koffi
    return this.lib.GetVersion();
  }
}

module.exports = { PromptToQuery, PromptToQueryError };
