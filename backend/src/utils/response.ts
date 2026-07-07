import { Response } from 'express';

interface Pagination {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

interface SuccessBody<T> {
    success: true;
    data: T;
    pagination?: Pagination;
}

/**
 * 200 OK — standard success response.
 */
export function successResponse<T>(res: Response, data: T, statusCode = 200): Response {
    const body: SuccessBody<T> = { success: true, data };
    return res.status(statusCode).json(body);
}

/**
 * 201 Created — use after successfully creating a resource.
 */
export function createdResponse<T>(res: Response, data: T): Response {
    return successResponse(res, data, 201);
}

/**
 * 204 No Content — use for successful deletes or actions with no body to return.
 * Does NOT send a JSON body (per HTTP spec, 204 responses must have no content).
 */
export function noContentResponse(res: Response): Response {
    return res.status(204).send();
}

/**
 * 200 OK — paginated list response with pagination metadata.
 */
export function paginatedResponse<T>(
    res: Response,
    data: T,
    total: number,
    page: number,
    limit: number,
): Response {
    const pages = limit > 0 ? Math.ceil(total / limit) : 0;

    const body: SuccessBody<T> = {
        success: true,
        data,
        pagination: { total, page, limit, pages },
    };

    return res.status(200).json(body);
}

export interface ErrorBody {
    success: false;
    message: string;
    errors?: any[];
    stack?: string;
}

/**
 * Sends a structured standard error API response.
 * 
 * @param res Express response object
 * @param message Error description message
 * @param statusCode HTTP Status Code (default 500)
 * @param errors Optional array of error details (validation issues, etc)
 * @param stack Optional stack trace for development mode
 */
export function errorResponse(
    res: Response,
    message: string,
    statusCode = 500,
    errors: any[] = [],
    stack?: string
): Response {
    const body: ErrorBody = {
        success: false,
        message,
        ...(errors && errors.length > 0 ? { errors } : {}),
        ...(stack ? { stack } : {}),
    };
    return res.status(statusCode).json(body);
}

// Keep sendError as alias for backward compatibility
export const sendError = errorResponse;