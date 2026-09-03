import React, { useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BlockRevealEffect, Streaming, TypewriterEffect } from '../src';
import type { StreamingItem } from '../src';
import workspaceImage from './assets/analytics-workspace.png';

interface StreamingDashboardProps {
  enabled: boolean;
  animation: boolean;
  speed: number;
  delay?: number;
  duration?: number;
  resetKey: number;
}

const colors = {
  ink: '#172033',
  muted: '#667085',
  line: '#e3e8ef',
  panel: '#ffffff',
  canvas: '#f4f7fb',
  blue: '#2563eb',
  blueSoft: '#eaf1ff',
  green: '#16805b',
  greenSoft: '#e8f7ef',
  amber: '#b96908',
  amberSoft: '#fff4df',
  red: '#bf3b45',
  redSoft: '#ffedef'
};

const dashboardStyle: React.CSSProperties = {
  width: 'min(1080px, 100%)',
  overflow: 'hidden',
  border: `1px solid ${colors.line}`,
  borderRadius: 8,
  background: colors.canvas,
  color: colors.ink,
  boxShadow: '0 14px 40px rgba(23, 32, 51, 0.12)',
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
};

const sectionStyle: React.CSSProperties = {
  padding: '28px 32px',
  borderBottom: `1px solid ${colors.line}`,
  background: colors.panel
};

const eyebrowStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 8,
  color: colors.muted,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.08em'
};

const cardStyle: React.CSSProperties = {
  minWidth: 0,
  padding: 18,
  border: `1px solid ${colors.line}`,
  borderRadius: 8,
  background: colors.panel
};

const metricData = [
  { label: 'Qualified leads', value: '1,284', change: '+18.6%', tone: 'green' },
  { label: 'Conversion rate', value: '7.42%', change: '+1.3 pts', tone: 'blue' },
  { label: 'Median response', value: '4m 12s', change: '-36s', tone: 'amber' },
  { label: 'At-risk accounts', value: '23', change: '-9.1%', tone: 'red' }
] as const;

const tableRows = [
  ['Enterprise', '426', '9.8%', 'High'],
  ['Mid-market', '518', '7.1%', 'Stable'],
  ['SMB', '340', '5.2%', 'Watch']
];

const statusStyle = (status: string): React.CSSProperties => ({
  display: 'inline-block',
  padding: '4px 8px',
  borderRadius: 999,
  background:
    status === 'High'
      ? colors.greenSoft
      : status === 'Watch'
        ? colors.amberSoft
        : colors.blueSoft,
  color:
    status === 'High'
      ? colors.green
      : status === 'Watch'
        ? colors.amber
        : colors.blue,
  fontSize: 12,
  fontWeight: 700
});

const createDashboardItems = (): StreamingItem[] => [
  {
    key: 'header',
    content: (
      <header style={{ ...sectionStyle, paddingBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 20
          }}
        >
          <div>
            <span style={{ ...eyebrowStyle, color: colors.blue }}>
              WEEKLY INTELLIGENCE / 03 SEP 2026
            </span>
            <h1 style={{ margin: '0 0 10px', fontSize: 30, lineHeight: 1.15 }}>
              Revenue operations report
            </h1>
            <p style={{ maxWidth: 620, margin: 0, color: colors.muted, lineHeight: 1.6 }}>
              A multi-format report showing how prose, metrics, media, analysis,
              tables and recommendations can arrive as one sequential stream.
            </p>
          </div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 999,
              background: colors.greenSoft,
              color: colors.green,
              fontSize: 12,
              fontWeight: 700
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'currentColor'
              }}
            />
            Live snapshot
          </span>
        </div>
      </header>
    )
  },
  {
    key: 'metrics',
    content: (
      <section style={sectionStyle}>
        <span style={eyebrowStyle}>EXECUTIVE PULSE</span>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12
          }}
        >
          {metricData.map((metric) => {
            const tone = {
              green: [colors.green, colors.greenSoft],
              blue: [colors.blue, colors.blueSoft],
              amber: [colors.amber, colors.amberSoft],
              red: [colors.red, colors.redSoft]
            }[metric.tone];

            return (
              <article key={metric.label} style={cardStyle}>
                <span style={{ display: 'block', color: colors.muted, fontSize: 13 }}>
                  {metric.label}
                </span>
                <strong style={{ display: 'block', margin: '10px 0 8px', fontSize: 28 }}>
                  {metric.value}
                </strong>
                <span style={{ color: tone[0], fontSize: 12, fontWeight: 700 }}>
                  {metric.change} vs last week
                </span>
              </article>
            );
          })}
        </div>
      </section>
    )
  },
  {
    key: 'visual',
    content: (
      <section style={sectionStyle}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
            alignItems: 'center'
          }}
        >
          <figure style={{ margin: 0 }}>
            <img
              src={workspaceImage}
              alt="Analytics dashboard displayed on a desktop monitor in a bright office"
              style={{
                display: 'block',
                width: '100%',
                aspectRatio: '3 / 2',
                objectFit: 'cover',
                borderRadius: 8
              }}
            />
            <figcaption style={{ marginTop: 8, color: colors.muted, fontSize: 11 }}>
              Workspace signal: the team is consolidating around one operating view.
            </figcaption>
          </figure>
          <div>
            <span style={eyebrowStyle}>SIGNAL STORY</span>
            <h2 style={{ margin: '0 0 12px', fontSize: 22, lineHeight: 1.25 }}>
              Faster responses are translating into healthier pipeline quality.
            </h2>
            <p style={{ margin: '0 0 16px', color: colors.muted, lineHeight: 1.65 }}>
              The largest lift comes from accounts that received a human follow-up
              within ten minutes. The effect is strongest in enterprise segments,
              where fewer but earlier touches are producing more qualified meetings.
            </p>
            <div
              style={{
                padding: 14,
                borderLeft: `3px solid ${colors.blue}`,
                background: colors.blueSoft,
                color: colors.ink,
                fontSize: 13,
                lineHeight: 1.55
              }}
            >
              <strong>Working hypothesis:</strong> response speed is now a leading
              indicator for opportunity quality, not only a service metric.
            </div>
          </div>
        </div>
      </section>
    )
  },
  {
    key: 'breakdown',
    content: (
      <section style={sectionStyle}>
        <span style={eyebrowStyle}>FUNNEL BREAKDOWN</span>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 12
          }}
        >
          <article style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <strong>Acquisition mix</strong>
              <span style={{ color: colors.green, fontSize: 12, fontWeight: 700 }}>
                +12.4%
              </span>
            </div>
            {[
              ['Organic search', '42%', colors.blue],
              ['Partner referrals', '31%', colors.green],
              ['Product-led', '19%', colors.amber],
              ['Other', '8%', '#98a2b3']
            ].map(([label, value, color]) => (
              <div key={label} style={{ marginTop: 16 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                    color: colors.muted,
                    fontSize: 12
                  }}
                >
                  <span>{label}</span>
                  <strong style={{ color: colors.ink }}>{value}</strong>
                </div>
                <div
                  style={{
                    height: 7,
                    overflow: 'hidden',
                    borderRadius: 999,
                    background: '#edf0f4'
                  }}
                >
                  <div
                    style={{
                      width: value,
                      height: '100%',
                      borderRadius: 999,
                      background: color
                    }}
                  />
                </div>
              </div>
            ))}
          </article>
          <article style={{ ...cardStyle, background: '#172033', color: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <strong>Quality index</strong>
              <span style={{ color: '#8bd8b5', fontSize: 12, fontWeight: 700 }}>
                Strong
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'end',
                gap: 4,
                height: 128,
                marginTop: 18
              }}
            >
              {[48, 58, 54, 72, 68, 84, 96].map((height, index) => (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    height: `${height}%`,
                    borderRadius: '4px 4px 0 0',
                    background: index === 6 ? '#8bd8b5' : '#5e78ad'
                  }}
                />
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 10,
                color: '#aeb9ce',
                fontSize: 11
              }}
            >
              <span>Mon</span>
              <span>Sun</span>
            </div>
            <p style={{ margin: '18px 0 0', color: '#d7deeb', fontSize: 13, lineHeight: 1.55 }}>
              The index improved for the fourth consecutive week, led by better
              qualification at the top of the funnel.
            </p>
          </article>
        </div>
      </section>
    )
  },
  {
    key: 'table',
    content: (
      <section style={sectionStyle}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'end',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 14
          }}
        >
          <div>
            <span style={eyebrowStyle}>SEGMENT DETAIL</span>
            <h2 style={{ margin: 0, fontSize: 20 }}>Performance by account tier</h2>
          </div>
          <span style={{ color: colors.muted, fontSize: 12 }}>Updated 09:42 UTC</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              minWidth: 560,
              borderCollapse: 'collapse',
              fontSize: 13
            }}
          >
            <thead>
              <tr style={{ color: colors.muted, textAlign: 'left' }}>
                {['Segment', 'Qualified leads', 'Conversion', 'Readout'].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    style={{
                      padding: '0 12px 10px',
                      borderBottom: `1px solid ${colors.line}`,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase'
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map(([segment, leads, conversion, status]) => (
                <tr key={segment}>
                  <th
                    scope="row"
                    style={{
                      padding: '15px 12px',
                      borderBottom: `1px solid ${colors.line}`,
                      textAlign: 'left'
                    }}
                  >
                    {segment}
                  </th>
                  <td style={{ padding: '15px 12px', borderBottom: `1px solid ${colors.line}` }}>
                    {leads}
                  </td>
                  <td style={{ padding: '15px 12px', borderBottom: `1px solid ${colors.line}` }}>
                    {conversion}
                  </td>
                  <td style={{ padding: '15px 12px', borderBottom: `1px solid ${colors.line}` }}>
                    <span style={statusStyle(status)}>{status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    )
  },
  {
    key: 'narrative',
    content: (
      <section style={sectionStyle}>
        <span style={eyebrowStyle}>LEADERSHIP NOTE</span>
        <blockquote
          style={{
            margin: 0,
            padding: '2px 0 2px 20px',
            borderLeft: `3px solid ${colors.amber}`,
            fontSize: 20,
            lineHeight: 1.45
          }}
        >
          "We are seeing a shift from activity volume to response quality. The next
          operating advantage is making the fast path repeatable across every team."
        </blockquote>
        <p style={{ margin: '14px 0 0 23px', color: colors.muted, fontSize: 12 }}>
          Maya Chen, VP Revenue Operations
        </p>
      </section>
    )
  },
  {
    key: 'actions',
    content: (
      <section style={{ ...sectionStyle, borderBottom: 0 }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'end',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 16
          }}
        >
          <div>
            <span style={eyebrowStyle}>NEXT 7 DAYS</span>
            <h2 style={{ margin: 0, fontSize: 20 }}>Recommended actions</h2>
          </div>
          <span
            style={{
              padding: '6px 10px',
              borderRadius: 999,
              background: colors.blueSoft,
              color: colors.blue,
              fontSize: 12,
              fontWeight: 700
            }}
          >
            3 priorities
          </span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 12
          }}
        >
          {[
            ['01', 'Protect the fast path', 'Set a ten-minute response target for new enterprise signals.', colors.blue],
            ['02', 'Scale the best source', 'Move partner-referral playbooks into the mid-market team.', colors.green],
            ['03', 'Review the watchlist', 'Run a recovery pass on the 23 accounts with declining intent.', colors.amber]
          ].map(([number, title, copy, color]) => (
            <article key={number} style={cardStyle}>
              <span style={{ color, fontSize: 12, fontWeight: 800 }}>{number}</span>
              <h3 style={{ margin: '10px 0 7px', fontSize: 16 }}>{title}</h3>
              <p style={{ margin: 0, color: colors.muted, fontSize: 13, lineHeight: 1.55 }}>
                {copy}
              </p>
            </article>
          ))}
        </div>
      </section>
    )
  }
];

const StreamingDashboard: React.FC<StreamingDashboardProps> = ({
  enabled,
  animation,
  speed,
  resetKey
}) => {
  const items = useMemo(createDashboardItems, []);

  return (
    <div style={dashboardStyle}>
      <Streaming
        key={resetKey}
        items={items}
        enabled={enabled}
        resetKey={resetKey}
        effect={TypewriterEffect}
        effectOptions={{ speed }}
        animation={animation}
        fallback={
          <div
            style={{
              padding: '14px 32px',
              background: colors.canvas,
              color: colors.muted,
              fontSize: 12
            }}
          >
            Loading the next report section...
          </div>
        }
      />
    </div>
  );
};

const meta = {
  title: 'Components/Streaming dashboard',
  component: StreamingDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A full report assembled from heterogeneous React nodes: text, metrics, image, progress bars, chart-like visuals, table, quote and action cards.'
      }
    }
  },
  argTypes: {
    enabled: {
      control: 'boolean',
      description: 'Reveal report sections in order.'
    },
    animation: {
      control: 'boolean',
      description: 'Animate the content of each visible section.'
    },
    speed: {
      control: { type: 'number', min: 10, max: 120, step: 5 },
      description: 'Milliseconds per character.'
    },
    resetKey: {
      control: { type: 'number', min: 0, max: 20, step: 1 },
      description: 'Change the value to replay all sections from the beginning.'
    }
  }
} satisfies Meta<typeof StreamingDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullReport: Story = {
  args: {
    enabled: true,
    animation: true,
    speed: 22,
    resetKey: 0
  }
};

export const InstantReport: Story = {
  args: {
    ...FullReport.args,
    animation: false
  }
};

export const BlockRevealReport: Story = {
  args: {
    ...FullReport.args,
    delay: 350,
    duration: 180
  },
  argTypes: {
    speed: {
      control: false,
      table: {
        disable: true
      }
    },
    delay: {
      control: { type: 'number', min: 0, max: 1200, step: 50 },
      description: 'Milliseconds to wait before revealing each block.'
    },
    duration: {
      control: { type: 'number', min: 0, max: 1200, step: 20 },
      description: 'Milliseconds for each block fade-in.'
    }
  },
  render: ({ enabled, animation, delay, duration, resetKey }) => (
    <div style={dashboardStyle}>
      <Streaming
        key={resetKey}
        items={createDashboardItems()}
        enabled={enabled}
        resetKey={resetKey}
        effect={BlockRevealEffect}
        effectOptions={{ delay, duration }}
        animation={animation}
        fallback={
          <div
            style={{
              padding: '14px 32px',
              background: colors.canvas,
              color: colors.muted,
              fontSize: 12
            }}
          >
            Loading the next report section...
          </div>
        }
      />
    </div>
  )
};
