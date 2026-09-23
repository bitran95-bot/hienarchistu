import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ContactModal } from './ContactModal';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function submit() {
  render(<ContactModal variant="split" onClose={() => {}} />);
  fireEvent.change(screen.getByLabelText('Họ và tên'), { target: { value: 'Test Studio' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
  fireEvent.change(screen.getByLabelText('Tin nhắn'), { target: { value: 'Preview test only.' } });
  fireEvent.submit(screen.getByRole('button', { name: 'Gửi tin nhắn' }).closest('form')!);
}

describe('contact feedback', () => {
  it.each([
    { status: 503, body: { success: false } },
    { status: 200, body: { success: false } },
    { status: 200, body: { success: true, mode: 'dev-log' } },
    { status: 200, body: {} },
  ])('preserves the message without a real success response: %j', async ({ status, body }) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status })));
    submit();
    expect(await screen.findByRole('alert')).toHaveTextContent('Có lỗi xảy ra');
    expect(screen.getByLabelText('Tin nhắn')).toHaveValue('Preview test only.');
  });

  it('resets the form only after confirmed success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"success":true}')));
    submit();
    expect(await screen.findByRole('alert')).toHaveTextContent('thành công');
    expect(screen.getByLabelText('Tin nhắn')).toHaveValue('');
  });

  it('explains rate limiting while retaining input', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"success":false}', { status: 429 })));
    submit();
    expect(await screen.findByRole('alert')).toHaveTextContent('quá nhiều lần');
    expect(screen.getByLabelText('Tin nhắn')).toHaveValue('Preview test only.');
  });
});
