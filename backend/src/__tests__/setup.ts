import type { Request, Response, NextFunction } from 'express'

// Use global jest and afterEach for compatibility
// Mock express request & response
export const mockRequest = () => {
  const req: Partial<Request> = {}
  req.body = {}
  req.params = {}
  req.query = {}
  return req
}

export const mockResponse = () => {
  const res: Partial<Response> = {}
  return {
    ...res,
    status: jest.fn((_code: number) => res) as any,
    json: jest.fn((_body: any) => res) as any,
    send: jest.fn((_body: any) => res) as any
  } as Response
}

// Mock auth middleware
export const mockAuthMiddleware = (jest as any).fn(
  (_req: Request, _res: Response, next: NextFunction) => next()
)

// Mock authorization middleware
export const mockAuthorize = (jest as any).fn(
  () => (_req: Request, _res: Response, next: NextFunction) => next()
)