import type {
  AIAdapter,
  ChatAdapter,
  HordeModel,
  HordeWorker,
  OpenRouterModel,
  PersonaFormat,
  RegisteredAdapter,
  ThirdPartyFormat,
} from '../adapters'
import type { GenerationPreset } from '../presets'
import type { ImageSettings } from './image-schema'
import type { TTSSettings, VoiceSettings } from './texttospeech-schema'
import { UISettings } from './ui'
import { FullSprite } from './sprite'
import { ModelFormat } from '../presets/templates'

export type AllDoc =
  | AppSchema.Announcement
  | AppSchema.Chat
  | AppSchema.ChatTree
  | AppSchema.ChatMessage
  | AppSchema.Character
  | AppSchema.User
  | AppSchema.Profile
  | AppSchema.ChatLock
  | AppSchema.ChatMember
  | AppSchema.ChatInvite
  | AppSchema.UserGenPreset
  | AppSchema.SubscriptionPreset
  | AppSchema.SubscriptionTier
  | AppSchema.MemoryBook
  | AppSchema.ScenarioBook
  | AppSchema.ApiKey
  | AppSchema.PromptTemplate
  | AppSchema.Configuration

export type OAuthScope = keyof typeof oauthScopes

export const oauthScopes = ['characters', 'chats', 'presets', 'profile'] as const

export type ChatBranch = {
  parent: string
  children: { [key: string]: number }
}

export namespace AppSchema {
  export interface Configuration {
    kind: 'configuration'

    /** JSON - merges with slots.txt, but this takes precedence when field collisions occur */
    slots: string

    /** Determines who can use API access for inferencing */
    apiAccess: 'off' | 'users' | 'subscribers' | 'admins'

    maintenance: boolean

    /** Markdown */
    maintenanceMessage: string

    /** Not yet implemented */
    policiesEnabled: boolean

    /** Not yet implemented */
    tosUpdated: string
    /** Not yet implemented */
    termsOfService: string

    /** Not yet implemented */
    privacyUpdated: string
    /** Not yet implemented */
    privacyStatement: string

    /** Concatenated to adapters listed in ADAPTERS envvar */
    /** Not yet implemented */
    enabledAdapters: string[]
  }

  export interface Announcement {
    kind: 'announcement'
    _id: string

    title: string
    content: string

    /** Date ISO string */
    showAt: string
    hide: boolean

    createdAt: string
    updatedAt: string
    deletedAt?: string
  }

  export interface SubscriptionTier {
    kind: 'subscription-tier'
    _id: string

    productId: string
    priceId: string
    patreon?: {
      tierId: string
      cost: number
    }
    apiAccess: boolean
    guidanceAccess: boolean

    name: string
    description: string
    cost: number
    level: number
    enabled: boolean
    disableSlots?: boolean
    createdAt: string
    deletedAt?: string
    updatedAt: string
  }

  export interface SubscriptionOption {
    _id: string
    name: string
    level: number
    service: AIAdapter
    guidance: boolean
    preset: GenSettings
  }

  export interface AppConfig {
    adapters: AIAdapter[]
    version: string
    canAuth: boolean
    imagesSaved: boolean
    assetPrefix: string
    selfhosting: boolean
    registered: Array<Omit<RegisteredAdapter, 'contextLimit'>>
    maintenance?: string
    patreon?: boolean
    policies?: boolean
    apiAccess?: boolean
    guidanceAccess?: boolean
    flags?: string
    patreonAuth?: {
      clientId: string
    }

    pipelineProxyEnabled: boolean
    authUrls: string[]
    horde: {
      models: HordeModel[]
      workers: HordeWorker[]
    }
    openRouter: { models: OpenRouterModel[] }
    subs: Array<SubscriptionOption>

    /** @todo remove after next deployment */
    tier?: AppSchema.SubscriptionTier
    serverConfig?: Configuration
  }

  export type ChatMode = 'standard' | 'adventure'

  export interface Token {
    userId: string
    username: string
    admin: boolean
    iat: number
    exp: number
  }

  export interface Profile {
    _id: string
    kind: 'profile'
    userId: string
    handle: string
    avatar?: string
  }

  export type SubscriptionType = 'native' | 'patreon' | 'manual'

  export interface User {
    _id: string

    updatedAt?: string

    kind: 'user'
    username: string
    hash: string
    apiKey?: string

    admin: boolean

    novelApiKey: string
    novelModel: string
    novelVerified?: boolean
    useLocalPipeline: boolean

    koboldUrl: string
    thirdPartyFormat: ThirdPartyFormat
    thirdPartyPassword: string
    thirdPartyPasswordSet?: boolean
    oobaUrl: string

    oaiKey: string
    oaiKeySet?: boolean

    hordeKey: string
    hordeModel: string | string[]
    hordeName?: string
    hordeUseTrusted?: boolean
    hordeWorkers?: string[]

    scaleUrl?: string
    scaleApiKey?: string
    scaleApiKeySet?: boolean

    claudeApiKey?: string
    claudeApiKeySet?: boolean

    elevenLabsApiKey?: string
    elevenLabsApiKeySet?: boolean

    defaultAdapter: AIAdapter
    defaultPresets?: { [key in AIAdapter]?: string }
    defaultPreset?: string

    createdAt?: string

    speechtotext?: {
      enabled: boolean
      autoSubmit: boolean
      autoRecord: boolean
    }

    texttospeech?: TTSSettings

    images?: ImageSettings
    adapterConfig?: { [key in AIAdapter]?: Record<string, any> }

    ui?: UISettings

    sub?: {
      type?: SubscriptionType
      tierId: string
      level: number
      last?: string
    }

    manualSub?: {
      tierId: string
      level: number
      expiresAt: string
    }

    patreonUserId?: string | null
    patreon?: {
      access_token: string
      refresh_token: string
      expires_in: number
      scope: string
      token_type: string
      expires: string
      user: Patreon.User
      tier?: Patreon.Tier
      member?: Patreon.Member
      sub?: {
        tierId: string
        level: number
      }
    }

    billing?: {
      status: 'active' | 'cancelled'
      cancelling?: boolean
      validUntil: string
      lastRenewed: string
      customerId: string
      subscriptionId: string
      lastChecked?: string
    }
    stripeSessions?: string[]
  }

  export interface ApiKey {
    _id: string
    kind: 'apikey'

    apikey: string
    code: string

    scopes: OAuthScope[]
    challenge?: string
    origin: string
    userId: string
    createdAt: string
    enabled: boolean
  }

  export interface ChatTree {
    _id: string
    kind: 'chat-tree'
    chatId: string
    userId: string

    tree: Record<string, ChatBranch>
  }

  export interface Chat {
    _id: string
    kind: 'chat'
    mode?: 'standard' | 'adventure' | 'companion'
    userId: string
    memoryId?: string
    userEmbedId?: string

    memberIds: string[]
    characters?: Record<string, boolean>
    tempCharacters?: Record<string, AppSchema.Character>

    name: string
    characterId: string
    messageCount: number
    adapter?: ChatAdapter

    greeting?: string
    scenario?: string
    sampleChat?: string
    systemPrompt?: string
    postHistoryInstructions?: string
    overrides?: Persona

    createdAt: string
    updatedAt: string

    genPreset?: GenerationPreset | string
    genSettings?: Omit<GenSettings, 'name'>

    scenarioIds?: string[]
    scenarioStates?: string[]

    treeLeafId?: string
  }

  export interface ChatMember {
    _id: string
    kind: 'chat-member'
    chatId: string
    userId: string
    createdAt: string
  }

  export type ChatAction = { emote: string; action: string }

  export interface ChatMessage {
    _id: string
    kind: 'chat-message'
    chatId: string
    msg: string
    retries: string[]
    extras?: string[]
    characterId?: string
    userId?: string

    adapter?: string
    imagePrompt?: string
    actions?: ChatAction[]

    createdAt: string
    updatedAt: string
    first?: boolean
    ooc?: boolean
    system?: boolean
    meta?: any
    event?: EventTypes | undefined
    state?: string
    values?: Record<string, string | number | boolean>
  }

  export type EventTypes = 'world' | 'character' | 'hidden' | 'ooc'

  /** Description of the character or user */
  export type Persona =
    | {
        kind: PersonaFormat
        attributes: { [key: string]: string[] }
      }
    | { kind: 'text'; attributes: { text: [string] } }

  export interface BaseCharacter {
    _id: string
    name: string
    description?: string
    appearance?: string
    avatar?: string
    persona: Persona
    greeting: string
    scenario: string
    sampleChat: string
  }

  export interface Character extends BaseCharacter {
    kind: 'character'
    userId: string

    culture?: string
    tags?: string[]

    visualType?: string
    sprite?: FullSprite

    createdAt: string
    updatedAt: string
    deletedAt?: string

    favorite?: boolean

    voice?: VoiceSettings
    voiceDisabled?: boolean

    // v2 stuff
    alternateGreetings?: string[]
    characterBook?: MemoryBook
    extensions?: Record<string, any>
    systemPrompt?: string
    postHistoryInstructions?: string
    insert?: { depth: number; prompt: string }
    creator?: string
    characterVersion?: string
    folder?: string
  }

  export interface ChatInvite {
    _id: string
    kind: 'chat-invite'
    byUserId: string
    invitedId: string
    chatId: string
    createdAt: string
    characterId: string
    state: 'pending' | 'rejected' | 'accepted'
  }

  export interface ChatLock {
    kind: 'chat-lock'

    /** Chat ID, Unique */
    chatLock: string

    /** Time to live in seconds. Locks older than this are invalid */
    ttl: number

    /** ISO string - We will ignore locks of a particular age */
    obtained: string

    /** We return this top the caller requesting a lock. It is used to ensure the lock is valid during a transaction. */
    lockId: string
  }

  export interface UserGenPreset extends GenSettings {
    _id: string
    kind: 'gen-setting'
    userId: string
  }

  export interface SubscriptionPreset extends GenSettings {
    _id: string
    kind: 'subscription-setting'
    subLevel: number
    subModel: string
    subApiKey: string
    subApiKeySet?: boolean
    subServiceUrl?: string
    subDisabled: boolean
    allowGuestUsage?: boolean
    isDefaultSub?: boolean
    deletedAt?: string
    tokenizer?: string
    guidanceCapable?: boolean
  }

  export interface GenSettings {
    name: string
    service?: AIAdapter

    temp: number
    dynatemp_range?: number
    dynatemp_exponent?: number
    maxTokens: number
    maxContextLength?: number
    repetitionPenalty: number
    repetitionPenaltyRange: number
    repetitionPenaltySlope: number
    typicalP: number
    minP?: number
    topP: number
    topK: number
    topA: number
    mirostatTau?: number
    mirostatLR?: number
    tailFreeSampling: number
    encoderRepitionPenalty?: number
    doSample?: boolean
    penaltyAlpha?: number
    numBeams?: number
    addBosToken?: boolean
    banEosToken?: boolean
    earlyStopping?: boolean
    stopSequences?: string[]
    trimStop?: boolean
    etaCutoff?: number
    epsilonCutoff?: number
    swipesPerGeneration?: number
    mirostatToggle?: boolean

    order?: number[]
    disabledSamplers?: number[]

    skipSpecialTokens?: boolean

    phraseBias?: Array<{ bias: number; seq: string }>
    phraseRepPenalty?: string
    cfgScale?: number
    cfgOppose?: string

    systemPrompt?: string
    ignoreCharacterSystemPrompt?: boolean
    gaslight?: string
    promptTemplateId?: string
    modelFormat?: ModelFormat
    useAdvancedPrompt?: 'basic' | 'validate' | 'no-validation'
    promptOrderFormat?: string
    promptOrder?: Array<{ placeholder: string; enabled: boolean }>
    ultimeJailbreak?: string
    prefixNameAppend?: boolean
    prefill?: string
    ignoreCharacterUjb?: boolean
    antiBond?: boolean

    frequencyPenalty?: number
    presencePenalty?: number
    oaiModel?: string
    novelModel?: string
    claudeModel?: string
    openRouterModel?: OpenRouterModel

    thirdPartyUrl?: string
    thirdPartyFormat?: ThirdPartyFormat
    thirdPartyUrlNoSuffix?: boolean
    thirdPartyModel?: string
    thirdPartyKey?: string

    replicateModelName?: string
    replicateModelType?: string
    replicateModelVersion?: string

    streamResponse?: boolean

    memoryDepth?: number
    memoryContextLimit?: number
    memoryReverseWeight?: boolean
    memoryChatEmbedLimit?: number
    memoryUserEmbedLimit?: number

    src?: string

    images?: {
      adapter: string
    }

    temporary?: Record<string, any>
    registered?: { [key in AIAdapter]?: Record<string, any> }
  }

  export interface PromptTemplate {
    kind: 'prompt-template'
    _id: string
    name: string
    template: string
    userId: string
    public?: boolean
    createdAt: string
    updatedAt: string
  }

  export interface MemoryBook {
    kind: 'memory'
    _id: string
    name: string
    description?: string
    userId: string
    entries: MemoryEntry[]

    // currently unsupported V2 fields which are here so that we don't destroy them
    scanDepth?: number
    tokenBudget?: number
    recursiveScanning?: boolean
    extensions?: Record<string, any>
  }

  export interface MemoryEntry {
    name: string

    /** The text injected into the prompt */
    entry: string

    /** Keywords that trigger the entry to be injected */
    keywords: string[]

    /** When choosing which memories to discard, lowest priority will be discarded first */
    priority: number

    /** When determining what order to render the memories, the highest will be at the bottom  */
    weight: number

    enabled: boolean

    // currently unsupported V2 fields which are here so that we don't destroy them
    id?: number
    comment?: string
    selective?: boolean
    secondaryKeys?: Array<string>
    constant?: boolean
    position?: 'before_char' | 'after_char'
  }

  export interface ScenarioBook {
    kind: 'scenario'
    _id: string
    userId: string
    name: string
    description?: string
    text: string
    overwriteCharacterScenario: boolean
    instructions?: string
    entries: ScenarioEvent[]
    states: string[]
  }

  export interface ScenarioEvent<T extends ScenarioEventTrigger = ScenarioEventTrigger> {
    /** The state this  */
    name: string
    requires: string[]
    assigns: string[]
    type: EventTypes
    text: string
    trigger: T
  }

  export type ScenarioEventTrigger =
    | ScenarioOnGreeting
    | ScenarioOnManual
    | ScenarioOnChatOpened
    | ScenarioOnCharacterMessageRx

  export interface ScenarioOnGreeting {
    kind: 'onGreeting'
  }

  export interface ScenarioOnManual {
    kind: 'onManualTrigger'
    probability: number
  }

  export interface ScenarioOnChatOpened {
    kind: 'onChatOpened'
    awayHours: number
  }

  export interface ScenarioOnCharacterMessageRx {
    kind: 'onCharacterMessageReceived'
    minMessagesSinceLastEvent: number
  }

  export type ScenarioTriggerKind = ScenarioEventTrigger['kind']

  export interface VoiceDefinition {
    id: string
    label: string
    previewUrl?: string
  }

  export interface VoiceModelDefinition {
    id: string
    label: string
  }
}

export type Doc<T extends AllDoc['kind'] = AllDoc['kind']> = Extract<AllDoc, { kind: T }>

export const defaultGenPresets: AppSchema.GenSettings[] = []

export type NewBook = Omit<AppSchema.MemoryBook, 'userId' | '_id' | 'kind'>

export type NewScenario = Omit<AppSchema.ScenarioBook, 'userId' | '_id' | 'kind'>

export namespace Patreon {
  export type Include = Tier | Member

  export type Tier = {
    id: string
    type: 'tier'
    attributes: {
      amount_cents: number
      description: string
      title: string
    }
    relationships: {
      campaign: {
        data: {
          id: string
          type: 'campaign'
        }
      }
    }
  }

  export type Member = {
    type: 'member'
    id: string
    attributes: {
      campaign_lifetime_support_cents: number
      campaign_entitled_amount_cents: number
      last_charge_date: string
      last_charge_status:
        | 'Paid'
        | 'Declined'
        | 'Deleted'
        | 'Pending'
        | 'Refunded'
        | 'Fraud'
        | 'Other'
        | null
      next_charge_date: string
      patron_status: 'active_patron' | 'declined_patron' | 'former_patron'
      pledge_relationship_start: string
      will_pay_amount_cents: number
    }
    relationships: {
      currently_entitled_tiers: { data: Array<{ type: 'tier'; id: string }> }
    }
  }

  export type User = {
    type: 'user'
    id: string
    attributes: {
      created: string
      email: string
      full_name: string
    }
    relationships: {
      memberships: {
        data: Array<{ id: string; type: 'member' }>
      }
    }
  }

  export type Authorize = {
    access_token: string
    refresh_token: string
    scope: string
    expires_in: number
    token_type: string
    version: string
  }
}
