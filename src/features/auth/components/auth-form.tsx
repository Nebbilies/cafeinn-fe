'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Anchor,
  Button,
  Container,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { errorKey, signIn, staffRequest, sessionQuery } from '../api/auth.api';

export function AuthForm({ recovery = false }: { recovery?: boolean }) {
  const { t } = useTranslation();
  const router = useRouter();
  const client = useQueryClient();
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const mutation = useMutation({
    mutationFn: async (form: FormData | null) => {
      if (recovery && (!sent || !form)) {
        const address = form ? String(form.get('email')) : email;
        await staffRequest('/auth/recovery/request', 'POST', { email: address });
        setEmail(address);
        setSent(true);
      } else if (form && recovery) {
        await staffRequest('/auth/recovery/reset', 'POST', {
          email,
          code: form.get('code'),
          password: form.get('password'),
        });
        setDone(true);
      } else if (form) {
        const staff = await signIn(String(form.get('identifier')), String(form.get('password')));
        client.removeQueries({ queryKey: ['private'] });
        client.setQueryData(sessionQuery.queryKey, staff);
        router.replace('/portal');
      }
    },
  });
  return (
    <Container size={420} py="xl">
      <Paper withBorder p="xl" radius="md">
        <Stack>
          <BrandLogo height={40} />
          <Title order={1} size="h2">
            {t(recovery ? 'auth.recovery' : 'auth.login')}
          </Title>
          {done ? (
            <Text role="status">{t('auth.resetDone')}</Text>
          ) : (
            <form
              method="post"
              onSubmit={(event) => {
                event.preventDefault();
                mutation.mutate(new FormData(event.currentTarget));
              }}
            >
              <Stack>
                {recovery ? (
                  <TextInput
                    type="email"
                    label={t('auth.email')}
                    name="email"
                    autoComplete="email"
                    readOnly={sent}
                    required
                    defaultValue={email}
                  />
                ) : (
                  <TextInput
                    name="identifier"
                    autoComplete="username"
                    label={t('auth.identifier')}
                    required
                  />
                )}
                {sent && (
                  <>
                    <Text size="sm" role="status">
                      {t('auth.sent')}
                    </Text>
                    <TextInput
                      name="code"
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      label={t('auth.code')}
                      required
                    />
                  </>
                )}
                {(!recovery || sent) && (
                  <PasswordInput
                    name="password"
                    autoComplete={recovery ? 'new-password' : 'current-password'}
                    minLength={recovery ? 8 : undefined}
                    label={t('auth.password')}
                    required
                  />
                )}
                <Button type="submit" loading={mutation.isPending}>
                  {t(!recovery ? 'auth.login' : sent ? 'auth.reset' : 'auth.send')}
                </Button>
                {sent && (
                  <Button
                    variant="subtle"
                    disabled={mutation.isPending}
                    onClick={() => mutation.mutate(null)}
                  >
                    {t('auth.resend')}
                  </Button>
                )}
              </Stack>
            </form>
          )}
          {mutation.error && (
            <Text c="red" role="alert">
              {t(errorKey(mutation.error), { defaultValue: t('auth.errors.generic') })}
            </Text>
          )}
          <Anchor component={Link} href={recovery ? '/login' : '/forgot-password'}>
            {t(recovery ? 'auth.login' : 'auth.recovery')}
          </Anchor>
        </Stack>
      </Paper>
    </Container>
  );
}
