'use client';
import { useEffect, useId, useRef, useState } from 'react';
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  MultiSelect,
  PasswordInput,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Paper,
  Pagination,
} from '@mantine/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ApiError } from '@/shared/api/api-error';
import { errorKey } from '@/features/auth/api/auth.api';
import { PortalPageHeader } from '@/features/portal/components/portal-page-header';
import { PortalIcon } from '@/features/portal/components/portal-icon';
import { getAccountInitial } from '@/features/portal/portal-account';
import {
  employeeDetail, listEmployees, roleNames, saveEmployee,
  type Employee, type EmployeeSort, type EmployeeStatus,
} from '../api/employees.api';

const staffId = (id: number) => 'NV' + String(id).padStart(3, '0');
const nextSort: Record<EmployeeSort, EmployeeSort> = {
  'id.asc': 'name.asc',
  'name.asc': 'name.desc',
  'name.desc': 'id.asc',
};
const statuses = ['ACTIVE', 'INACTIVE'] as const;
type EmployeeDialog = { employee: number | 'new'; viewOnly: boolean; generation: number };

function EmployeeDetails({ employee }: { employee: Employee }) {
  const { t } = useTranslation();

  return (
    <Stack gap="md">
      <Group wrap="nowrap" align="flex-start">
        <Avatar size={48} radius="xl" color="cafe" aria-hidden="true">
          {getAccountInitial(employee.fullName)}
        </Avatar>
        <Box style={{ minWidth: 0, flex: 1, overflowWrap: 'anywhere' }}>
          <Text fw={600} size="lg">{employee.fullName}</Text>
          <Group gap="xs" mt={4}>
            <Text size="sm" c="dimmed">{staffId(employee.id)}</Text>
            <Badge variant="dot" color={employee.status === 'ACTIVE' ? 'success' : 'neutral'}>
              {t('auth.' + employee.status)}
            </Badge>
          </Group>
        </Box>
      </Group>

      <Divider />

      <Box component="dl" m={0} style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 9rem), 1fr))',
        gap: 'var(--mantine-spacing-md)',
        overflowWrap: 'anywhere',
      }}>
        <Box style={{ gridColumn: '1 / -1' }}>
          <Text component="dt" size="sm" c="dimmed" mb={4}>{t('auth.roles')}</Text>
          <Group component="dd" m={0} gap="xs">
            {employee.roles.length ? employee.roles.map((role) => (
              <Badge key={role} variant="light" tt="none">{t('auth.' + role)}</Badge>
            )) : <Text size="sm">{t('auth.notAssigned')}</Text>}
          </Group>
        </Box>
        {(['username', 'phone'] as const).map((field) => (
          <Box key={field}>
            <Text component="dt" size="sm" c="dimmed">{t('auth.' + field)}</Text>
            <Text component="dd" m={0}>{employee[field] || t('auth.notProvided')}</Text>
          </Box>
        ))}
        <Box style={{ gridColumn: '1 / -1' }}>
          <Text component="dt" size="sm" c="dimmed">{t('auth.email')}</Text>
          <Text component="dd" m={0}>{employee.email}</Text>
        </Box>
      </Box>
    </Stack>
  );
}

function EmployeeForm({
  row,
  onSave,
  pending,
}: {
  row?: Employee;
  onSave: (body: unknown) => void;
  pending: boolean;
}) {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<string[]>(row?.roles ?? []);
  const [status, setStatus] = useState(row?.status ?? 'ACTIVE');
  return (
    <form
      method="post"
      onSubmit={(event) => {
        event.preventDefault();
        const form = Object.fromEntries(new FormData(event.currentTarget));
        onSave({ ...form, phone: form.phone || null, roles, status });
      }}
    >
      <Stack>
        {(['fullName', 'username', 'email', 'phone'] as const).map((field) => (
          <TextInput
            key={field}
            name={field}
            label={t('auth.' + field)}
            defaultValue={row?.[field] ?? ''}
            type={field === 'email' ? 'email' : 'text'}
            pattern={field === 'username' ? '[^@\\s]+' : undefined}
            required={field !== 'phone'}
          />
        ))}
        {!row && (
          <>
            {['password', 'confirmation'].map((field) => (
              <PasswordInput
                key={field}
                name={field}
                label={t('auth.' + field)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            ))}
          </>
        )}
        <MultiSelect
          label={t('auth.roles')}
          data={roleNames.map((value) => ({ value, label: t('auth.' + value) }))}
          value={roles}
          onChange={setRoles}
          comboboxProps={{ withinPortal: false }}
        />
        <Select
          label={t('auth.status')}
          value={status}
          allowDeselect={false}
          data={(['ACTIVE', 'INACTIVE'] as const).map((value) => ({ value, label: t('auth.' + value) }))}
          onChange={(value) => setStatus(value === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE')}
        />
        <Button type="submit" loading={pending}>
          {t('auth.save')}
        </Button>
      </Stack>
    </form>
  );
}
export function EmployeePage() {
  const { t } = useTranslation();
  const client = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState<EmployeeDialog | null>(null);
  const dialogScope = useId();
  const latestGeneration = useRef(0);
  const editing = dialog?.employee;
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | null>(null);
  const [sort, setSort] = useState<EmployeeSort>('id.asc');
  const prefix = ['private', 'employees'];
  const listQuery = { page, pageSize: 10, search: search.trim(), status: statusFilter, sort };
  const list = useQuery({
    queryKey: [...prefix, 'list', listQuery],
    queryFn: ({ signal }) => listEmployees(listQuery, signal),
    retry: false,
  });
  const detail = useQuery({
    queryKey: [...prefix, 'detail', editing, dialogScope, dialog?.generation],
    enabled: typeof editing === 'number',
    queryFn: ({ signal }) => employeeDetail(Number(editing), signal),
    retry: false,
    gcTime: 0,
  });
  const mutation = useMutation({
    mutationFn: ({ dialog, body }: { dialog: EmployeeDialog; body: unknown }) =>
      saveEmployee(dialog.employee === 'new' ? null : dialog.employee, body),
    onSuccess: async (_, submitted) => {
      setDialog((current) => current?.generation === submitted.dialog.generation ? null : current);
      await client.invalidateQueries({ queryKey: ['private', 'session'] });
      await client.invalidateQueries({ queryKey: ['private', 'employees'] });
    },
  });
  const error = mutation.error ?? detail.error ?? list.error;
  const denied = [list.error, detail.error, mutation.error].find(
    (value) => value instanceof ApiError && (value.status === 401 || value.code === 'FORBIDDEN'),
  );
  useEffect(() => {
    if (denied) {
      client.removeQueries({ queryKey: ['private'] });
      window.location.replace(denied instanceof ApiError && denied.status === 401 ? '/login' : '/portal');
    }
  }, [denied, client]);
  const totalPages = list.data?.pagination.totalPages ?? 0;
  const currentPage = Math.min(page, Math.max(1, totalPages));
  if (list.data?.pagination.page === page && page !== currentPage) setPage(currentPage);
  if (denied) return null;
  const message = error && (
    <Text c="red" role="alert">
      {t(errorKey(error), { defaultValue: t('auth.errors.generic') })}
    </Text>
  );
  const open = (id: number | 'new', readOnly = false) => {
    mutation.reset();
    setDialog({ employee: id, viewOnly: readOnly, generation: ++latestGeneration.current });
  };
  return (
    <Stack>
      <PortalPageHeader
        title={t('portal.employeesTitle')}
        actions={<Button onClick={() => open('new')}>{t('auth.create')}</Button>}
      />
      <Paper withBorder p="md">
        <Stack>
          <Group justify="flex-end">
            <Select
              aria-label={t('auth.status')}
              placeholder={t('auth.status')}
              clearable
              value={statusFilter}
              data={statuses.map((value) => ({ value, label: t('auth.' + value) }))}
              onChange={(value) => {
                setStatusFilter(statuses.find((status) => status === value) ?? null);
                setPage(1);
              }}
            />
            <TextInput
              leftSection={<PortalIcon name="search" />}
              leftSectionPointerEvents="none"
              aria-label={t('auth.search')}
              placeholder={t('auth.search')}
              maxLength={100}
              value={search}
              onChange={(e) => {
                setSearch(e.currentTarget.value);
                setPage(1);
              }}
            />
          </Group>
          {!dialog && message}
          <Table.ScrollContainer minWidth={540}>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('auth.staffId')}</Table.Th>
                  <Table.Th aria-sort={sort === 'name.asc' ? 'ascending' : sort === 'name.desc' ? 'descending' : 'none'}>
                    <Group gap={4} wrap="nowrap">
                      {t('auth.fullName')}
                      <ActionIcon
                        variant={sort === 'id.asc' ? 'subtle' : 'light'}
                        size="sm"
                        aria-label={t('auth.sortName')}
                        title={t('auth.sortName')}
                        onClick={() => {
                          setSort((current) => nextSort[current]);
                          setPage(1);
                        }}
                      >
                        <Box style={{ display: 'flex', transform: sort === 'name.desc' ? 'scaleY(-1)' : undefined }}>
                          <PortalIcon name="sort" />
                        </Box>
                      </ActionIcon>
                    </Group>
                  </Table.Th>
                  {['email', 'roles', 'status', 'actions'].map((k) => (
                    <Table.Th key={k}>{t('auth.' + k)}</Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {list.data?.items.map((e) => (
                  <Table.Tr key={e.id}>
                    <Table.Td>{staffId(e.id)}</Table.Td>
                    <Table.Td>{e.fullName}</Table.Td>
                    <Table.Td>{e.email}</Table.Td>
                    <Table.Td>{e.roles.map((r) => t('auth.' + r)).join(', ')}</Table.Td>
                    <Table.Td>{t('auth.' + e.status)}</Table.Td>
                    <Table.Td>
                      <Button variant="subtle" onClick={() => open(e.id, true)}>
                        {t('auth.detail')}
                      </Button>
                      <Button variant="subtle" onClick={() => open(e.id)}>
                        {t('auth.edit')}
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
          {list.isPending && <Text role="status">{t('auth.loading')}</Text>}
          {list.isSuccess && !list.data.items.length && <Text>{t('auth.empty')}</Text>}
          {totalPages > 1 && <Pagination value={currentPage} total={totalPages} onChange={setPage} />}
        </Stack>
      </Paper>
      <Modal
        opened={dialog !== null}
        onClose={() => setDialog(null)}
        title={t(editing === 'new' ? 'auth.create' : dialog?.viewOnly ? 'auth.employeeDetails' : 'auth.edit')}
        closeButtonProps={{ 'aria-label': t('auth.closeDialog') }}
      >
        {message}
        {dialog?.viewOnly && detail.data ? (
          <EmployeeDetails employee={detail.data} />
        ) : dialog && (editing === 'new' || detail.data) ? (
          <EmployeeForm
            key={dialog.generation}
            row={editing === 'new' ? undefined : detail.data}
            pending={mutation.isPending}
            onSave={(body) => mutation.mutate({ dialog, body })}
          />
        ) : dialog && detail.isPending && <Text role="status">{t('auth.loading')}</Text>}
      </Modal>
    </Stack>
  );
}
