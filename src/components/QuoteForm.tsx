import { requestQuote } from "@/app/actions";
import { ActionForm } from "@/components/FormStatus";
import { QUOTE_SERVICES } from "@/lib/quote-lead";

const field =
  "mt-1 w-full rounded-lg border border-slate/15 bg-white px-3 py-2 outline-none focus:border-amber";

export function QuoteForm({ listingId }: { listingId: string }) {
  return (
    <div className="rounded-2xl border border-slate/10 bg-white p-6">
      <h2 className="font-display text-2xl text-slate">Request a quote</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        This request is saved on this listing only. Phone or email is required.
      </p>
      <ActionForm
        action={requestQuote}
        className="mt-5 space-y-4"
        submitLabel="Request a quote"
        hideFormOnSuccess
      >
        <input type="hidden" name="listingId" value={listingId} />
        <label className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden="true">
          Fax
          <input type="text" name="fax" tabIndex={-1} autoComplete="off" />
        </label>
        <label className="block text-sm">
          Name
          <input name="name" required className={field} autoComplete="name" />
        </label>
        <label className="block text-sm">
          Phone
          <input name="phone" type="tel" className={field} autoComplete="tel" />
        </label>
        <label className="block text-sm">
          Email
          <input name="email" type="email" className={field} autoComplete="email" />
        </label>
        <label className="block text-sm">
          ZIP
          <input name="zip" required inputMode="numeric" className={field} autoComplete="postal-code" />
        </label>
        <label className="block text-sm">
          Work
          <select name="service" required defaultValue="" className={field}>
            <option value="" disabled>
              Choose one
            </option>
            {QUOTE_SERVICES.map((service) => (
              <option key={service.key} value={service.key}>
                {service.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Job description
          <textarea name="message" required rows={4} className={field} />
        </label>
      </ActionForm>
    </div>
  );
}
