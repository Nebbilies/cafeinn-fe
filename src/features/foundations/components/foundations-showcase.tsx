'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Anchor, Badge, Box, Button, Card, Container, Group, Input, Modal,
  NumberInput, Paper, SimpleGrid, Stack, Table, Text, TextInput, Title,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { sizes, spacing, radius } from '@/shared/config/design-tokens';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { ColorSchemeSwitcher } from '@/shared/ui/color-scheme-switcher';
import { LocaleSwitcher } from '@/shared/ui/locale-switcher';
import classes from './foundations-showcase.module.css';

const colorRoles = [
  'background-body', 'background-surface', 'text-default', 'text-dimmed',
  'background-primary-filled', 'background-primary-light', 'border-default',
  'border-control', 'status-success', 'status-warning', 'status-error', 'status-info',
] as const;
const variants = ['filled', 'light', 'outline', 'subtle', 'default', 'white'] as const;
const tones = ['cafe', 'success', 'warning', 'error', 'info', 'neutral'] as const;

export function FoundationsShowcase() {
  const { t } = useTranslation();
  const [modalOpened, setModalOpened] = useState(false);
  const label = (key: string) => t(`foundations.${key}`);

  return (
    <Container component="main" size="lg" py="xl" className={classes.showcase}>
      <Stack gap={32}>
        <Group justify="space-between" align="center">
          <BrandLogo />
          <LocaleSwitcher />
        </Group>
        <Stack gap="sm">
          <Text size="sm" c="dimmed">{label('developmentOnly')}</Text>
          <Title order={1}>{label('title')}</Title>
          <Text c="dimmed">{label('description')}</Text>
          <Group justify="space-between">
            <ColorSchemeSwitcher />
            <Anchor component={Link} href="/">{label('home')}</Anchor>
          </Group>
        </Stack>

        <Stack component="section" gap="md" aria-labelledby="colors-heading">
          <Title id="colors-heading" order={2}>{label('colors')}</Title>
          <Text size="sm" c="dimmed">{label('verified')}</Text>
          <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }}>
            {colorRoles.map((role) => (
              <Paper key={role} p="sm" withBorder>
                <Box h={40} mb="xs" bg={`var(--cafe-${role})`} className={classes.swatch} />
                <Text size="xs" className={classes.role}>{role}</Text>
              </Paper>
            ))}
          </SimpleGrid>
        </Stack>

        <Paper component="section" withBorder p="lg" aria-labelledby="type-heading">
          <Stack gap="md">
            <Title id="type-heading" order={2}>{label('typography')}</Title>
            <Title order={3}>{label('sample')}</Title>
            {sizes.map((size) => <Text key={size} size={size}>{size} · {label('sample')} · 125.000 ₫</Text>)}
            <Group>{[400, 500, 600].map((weight) => <Text key={weight} fw={weight}>{weight} · Be Vietnam Pro</Text>)}</Group>
            <Text size="sm" c="dimmed">{label('fontNote')}</Text>
            <Group>{[24, 32, 48].map((size) => <Box key={size} component="span" p="xs" bg="cafe.0" style={{ borderRadius: 'var(--mantine-radius-sm)' }}><Image src="/brand/cafeinn-mark.svg" width={size} height={size} alt={`CafeInn · ${size}px`} unoptimized /></Box>)}</Group>
          </Stack>
        </Paper>

        <Stack component="section" aria-labelledby="geometry-heading">
          <Title id="geometry-heading" order={2}>{label('geometry')}</Title>
          <Group gap="lg">{sizes.map((size) => <Stack key={size} gap="xs" align="center">
            <Box w={56} h={56} bg="var(--cafe-background-primary-light)" style={{ border: '1px solid var(--cafe-border-control)', borderRadius: radius[size] }} />
            <Text size="xs">{size} · {radius[size]}px</Text>
          </Stack>)}</Group>
          <Group gap="lg">{sizes.map((size) => <Stack key={size} gap="xs">
            <Box w={spacing[size]} h={12} bg="var(--cafe-background-primary-filled)" />
            <Text size="xs">{size} · {spacing[size]}px</Text>
          </Stack>)}</Group>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Paper withBorder p="md" shadow="md">{label('verifiedShadow')}</Paper>
            <Card withBorder p="md" shadow="xs"><Text>{label('fallbackShadow')}</Text></Card>
          </SimpleGrid>
        </Stack>

        <Paper component="section" withBorder p="lg" aria-labelledby="buttons-heading">
          <Stack gap="lg">
            <Title id="buttons-heading" order={2}>{label('buttons')}</Title>
            <Group>{variants.map((variant) => <Button key={variant} variant={variant}>{variant}</Button>)}</Group>
            <Group>{sizes.map((size) => <Button key={size} size={size}>{size}</Button>)}</Group>
            <Group>
              <Button disabled>{label('disabled')}</Button>
              <Button loading aria-label={label('loading')}>{label('loading')}</Button>
              <Button color="error">{label('destructive')}</Button>
              <Button color="red.8">{label('explicitColor')}</Button>
            </Group>
            <Text size="sm" c="dimmed">{label('keyboardNote')}</Text>
          </Stack>
        </Paper>

        <Paper component="section" withBorder p="lg" aria-labelledby="inputs-heading">
          <Stack gap="lg">
            <Title id="inputs-heading" order={2}>{label('inputs')}</Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput label={label('guestName')} description={label('inputDescription')} placeholder={label('placeholder')} />
              <TextInput label={label('filledInput')} variant="filled" defaultValue="Nguyễn Minh Anh" />
              <TextInput label={label('errorInput')} error={label('inputError')} defaultValue="Nguyễn Minh Anh" />
              <TextInput label={label('disabledInput')} disabled defaultValue="Nguyễn Minh Anh" />
              <NumberInput label={label('quantity')} defaultValue={2} min={0} max={99} />
              <TextInput label={label('unstyledInput')} variant="unstyled" placeholder={label('placeholder')} />
            </SimpleGrid>
            <Input aria-label={label('baseInput')} placeholder={label('baseInput')} size="md" />
          </Stack>
        </Paper>

        <Paper component="section" withBorder p="lg" aria-labelledby="badges-heading">
          <Stack gap="md">
            <Title id="badges-heading" order={2}>{label('badges')}</Title>
            {(['light', 'filled', 'outline', 'dot'] as const).map((variant) => <Group key={variant}>
              <Text w={56} size="xs">{variant}</Text>
              {tones.map((tone) => <Badge key={tone} color={tone} variant={variant}>{label(tone)}</Badge>)}
            </Group>)}
            <Group>{sizes.map((size) => <Badge key={size} size={size} variant="light">{size}</Badge>)}</Group>
          </Stack>
        </Paper>

        <Paper component="section" withBorder p="lg" aria-labelledby="table-heading">
          <Stack gap="md">
            <Title id="table-heading" order={2}>{label('table')}</Title>
            <Text size="sm" c="dimmed">{label('tableNote')}</Text>
            <Table highlightOnHover withColumnBorders className={classes.table}>
              <Table.Thead><Table.Tr><Table.Th>{label('item')}</Table.Th><Table.Th>{label('state')}</Table.Th><Table.Th ta="right">{label('price')}</Table.Th></Table.Tr></Table.Thead>
              <Table.Tbody>
                <Table.Tr><Table.Td>{label('coffee')}</Table.Td><Table.Td><Badge color="success" variant="light">{label('available')}</Badge></Table.Td><Table.Td ta="right">45.000 ₫</Table.Td></Table.Tr>
                <Table.Tr><Table.Td>{label('longItem')}</Table.Td><Table.Td><Badge color="warning" variant="light">{label('pending')}</Badge></Table.Td><Table.Td ta="right">65.000 ₫</Table.Td></Table.Tr>
              </Table.Tbody>
            </Table>
          </Stack>
        </Paper>

        <Stack component="section" aria-labelledby="modal-heading">
          <Title id="modal-heading" order={2}>{label('modal')}</Title>
          <Button style={{ alignSelf: 'flex-start' }} onClick={() => setModalOpened(true)}>{label('openModal')}</Button>
          <Text size="sm" c="dimmed">{label('modalNote')}</Text>
        </Stack>
      </Stack>
      <Modal opened={modalOpened} onClose={() => setModalOpened(false)} title={label('modalTitle')} closeButtonProps={{ 'aria-label': label('close') }}>
        <Stack gap="md">
          <Text>{label('modalBody')}</Text>
          <TextInput label={label('guestName')} placeholder={label('placeholder')} />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setModalOpened(false)}>{label('cancel')}</Button>
            <Button onClick={() => setModalOpened(false)}>{label('confirm')}</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
