import type { FilterQuery, Model, PopulateOptions, Schema } from 'mongoose';

/**
 * Options for pagination query
 */
export interface PaginateOptions {
  /** Sorting criteria using the format: sortField:(desc|asc). Multiple sorting criteria should be separated by commas */
  sortBy?: string;
  /** Populate data fields. Can be a string, object, or array of populate options */
  populate?: string | PopulateOptions | Array<string | PopulateOptions>;
  /** Maximum number of results per page (default = 10) */
  limit?: number | string;
  /** Current page (default = 1) */
  page?: number | string;
  /** Number of documents to skip (calculated automatically if not provided) */
  skip?: number;
}

/**
 * Result of a paginated query
 */
export interface PaginateResult<T> {
  /** Results found */
  results: T[];
  /** Current page */
  page: number;
  /** Maximum number of results per page */
  limit: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of documents */
  totalResults: number;
}

/**
 * Pagination plugin for Mongoose schemas
 * @param schema - Mongoose schema to add pagination to
 */
function paginate<T>(schema: Schema<T>): void {
  /**
   * Query for documents with pagination
   * @param filter - Mongo filter
   * @param options - Query options
   * @returns Promise resolving to paginated results
   */
  schema.statics.paginate = async function <DocType>(
    this: Model<DocType>,
    filter: FilterQuery<DocType>,
    options: PaginateOptions,
  ): Promise<PaginateResult<DocType>> {
    const { limit, page, skip, populate } = options;
    const { sortBy } = options;

    const parsedLimit = limit && Number.parseInt(String(limit), 10) > 0 ? Number.parseInt(String(limit), 10) : 10;
    const parsedPage = page && Number.parseInt(String(page), 10) > 0 ? Number.parseInt(String(page), 10) : 1;
    const calculatedSkip = skip ?? (parsedPage - 1) * parsedLimit;

    let sort = '';
    if (sortBy) {
      const sortingCriteria: string[] = [];
      sortBy.split(',').forEach((sortOption: string) => {
        const [key, value] = sortOption.split(':');
        if (key) {
          sortingCriteria.push((value === 'desc' ? '-' : '') + key);
        }
      });
      sort = sortingCriteria.join(' ');
    } else {
      sort = '-createdAt';
    }

    const countPromise = this.countDocuments(filter).exec();
    let docsPromise = this.find(filter).sort(sort).skip(calculatedSkip).limit(parsedLimit);

    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach((p) => {
          if (typeof p === 'string') {
            docsPromise = docsPromise.populate(p);
          } else {
            docsPromise = docsPromise.populate(p);
          }
        });
      } else if (typeof populate === 'string') {
        docsPromise = docsPromise.populate(populate);
      } else {
        docsPromise = docsPromise.populate(populate);
      }
    }

    // biome-ignore lint/suspicious/noExplicitAny: Complex Mongoose generic type inference issue with lean()
    docsPromise = docsPromise.lean() as any;

    const [totalResults, results] = await Promise.all([countPromise, docsPromise.exec()]);
    const totalPages = Math.ceil(totalResults / parsedLimit);

    return {
      results,
      page: parsedPage,
      limit: parsedLimit,
      totalPages,
      totalResults,
    };
  };
}

export default paginate;
