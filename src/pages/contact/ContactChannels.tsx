import { ArrowRight, Check } from 'lucide-react'
import { CONTACT_CHANNELS } from './contactData'

/**
 * ContactChannels — the four primary contact channels.
 *
 * Layout:
 *   - Mobile: 1 column stack
 *   - md:     2 columns
 *   - lg:     4 columns, equal-width
 *
 * Each card has:
 *   - Colored icon bubble with channel-specific gradient
 *   - Channel name + Vietnamese description
 *   - Response time hint
 *   - CTA button (opens Messenger / Zalo / mailto: / tel:)
 */
export function ContactChannels() {
  return (
    <section
      aria-labelledby="contact-channels-title"
      className="px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <header className="sr-only">
          <h2
            id="contact-channels-title"
            className="font-heading text-2xl text-gray-900 md:text-3xl"
          >
            Chọn kênh thuận tiện nhất với bạn
          </h2>
        </header>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {CONTACT_CHANNELS.map(channel => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      </div>
    </section>
  )
}

interface ChannelCardProps {
  channel: (typeof CONTACT_CHANNELS)[number]
}

function ChannelCard({ channel }: ChannelCardProps) {
  const { Icon } = channel
  return (
    <article
      className={`channel-card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#d9a441]/15 bg-white p-6 shadow-soft ring-1 ring-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${channel.ring}`}
    >
      {/* Soft gradient halo on hover */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${channel.gradient} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-15`}
      />

      {/* Icon bubble */}
      <div
        className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${channel.iconBg} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-6deg]`}
      >
        <Icon size={26} className={channel.iconColor} aria-hidden="true" />
      </div>

      {/* Name + description */}
      <h3 className="font-heading text-lg text-gray-900">{channel.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{channel.description}</p>

      {/* Response time hint */}
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
        <Check size={14} className="text-emerald-500" aria-hidden="true" />
        <span>{channel.responseTime}</span>
      </div>

      {/* CTA */}
      <a
        href={channel.href}
        target={channel.external ? '_blank' : undefined}
        rel={channel.external ? 'noreferrer' : undefined}
        className={`mt-6 inline-flex items-center justify-between gap-2 rounded-xl bg-gradient-to-r ${channel.gradient} px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
      >
        <span>{channel.ctaLabel}</span>
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
      </a>
    </article>
  )
}
