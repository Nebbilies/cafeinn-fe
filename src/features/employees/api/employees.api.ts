import { z } from 'zod';
import { staffRequest } from '@/features/auth/api/auth.api';
export const roleNames = ['ADMIN', 'SALES_STAFF', 'EVENT_STAFF'] as const;
const employee = z.object({
  id: z.number(),
  username: z.string(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  roles: z.array(z.enum(roleNames)),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});
export type Employee = z.infer<typeof employee>;
export type EmployeeSort = 'id.asc' | 'name.asc' | 'name.desc';
export type EmployeeStatus = Employee['status'];
type EmployeeListQuery = {
  page: number;
  pageSize: number;
  search: string;
  status: EmployeeStatus | null;
  sort: EmployeeSort;
};
const employeePage = z.object({
  items: z.array(employee),
  pagination: z.object({
    page: z.int().min(1),
    pageSize: z.int().min(1).max(50),
    totalItems: z.int().min(0),
    totalPages: z.int().min(0),
  }),
});
export async function listEmployees(query: EmployeeListQuery, signal: AbortSignal) {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    sort: query.sort,
  });
  if (query.search) params.set('search', query.search);
  if (query.status) params.set('status', query.status);
  return employeePage.parse(await staffRequest('/employees?' + params, 'GET', undefined, signal));
}
export const employeeDetail = async (id: number, signal: AbortSignal) =>
  employee.parse(await staffRequest('/employees/' + id, 'GET', undefined, signal));
export function saveEmployee(id: number | null, body: unknown) {
  return staffRequest(id ? '/employees/' + id : '/employees', id ? 'PATCH' : 'POST', body);
}
