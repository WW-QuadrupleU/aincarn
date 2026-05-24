import type { AgentApi } from '../../shared/types'

declare global {
  interface Window {
    aincarn: AgentApi
  }
}
