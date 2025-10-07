export const REGISTRY_INDEX = {
    content_moderation: ['1.0.0', '1.1.0', '1.2.0', '2.0.0'],
    engagement_score: ['0.1.0', '0.2.0', '1.0.0'],
    reputation_rank: ['1.0.0'],
    voting_power: ['1.0.0', '1.1.0', '1.2.0', '1.3.0', '2.0.0', '2.1.0'],
}

export const DEFINITIONS = {
    'content_moderation@1.0.0': {
        key: 'content_moderation',
        name: 'Content Moderation',
        category: 'moderation',
        description:
            'Calculates content moderation scores based on user reports',
        version: '1.0.0',
        inputs: [
            {
                key: 'reports',
                label: 'Reports',
                description: 'User reports data',
                type: 'csv',
            },
        ],
        outputs: [
            {
                key: 'moderation_score',
                label: 'Moderation Score',
                type: 'score_map',
                entity: 'content',
                description: 'Content moderation scores',
            },
        ],
    },
    'content_moderation@1.1.0': {
        key: 'content_moderation',
        name: 'Content Moderation',
        category: 'moderation',
        description: 'Enhanced content moderation with weighted reports',
        version: '1.1.0',
        inputs: [
            {
                key: 'reports',
                label: 'Reports',
                description: 'User reports data',
                type: 'csv',
            },
            {
                key: 'weights',
                label: 'Reporter Weights',
                description: 'Weight for each reporter',
                type: 'csv',
            },
        ],
        outputs: [
            {
                key: 'moderation_score',
                label: 'Moderation Score',
                type: 'score_map',
                entity: 'content',
                description: 'Weighted moderation scores',
            },
        ],
    },
    'content_moderation@1.2.0': {
        key: 'content_moderation',
        name: 'Content Moderation',
        category: 'moderation',
        description: 'Advanced content moderation with ML integration',
        version: '1.2.0',
        inputs: [
            {
                key: 'reports',
                label: 'Reports',
                description: 'User reports data',
                type: 'csv',
            },
            {
                key: 'weights',
                label: 'Reporter Weights',
                description: 'Weight for each reporter',
                type: 'csv',
            },
        ],
        outputs: [
            {
                key: 'moderation_score',
                label: 'Moderation Score',
                type: 'score_map',
                entity: 'content',
                description: 'ML-enhanced moderation scores',
            },
        ],
    },
    'content_moderation@2.0.0': {
        key: 'content_moderation',
        name: 'Content Moderation v2',
        category: 'moderation',
        description: 'Complete rewrite with new architecture',
        version: '2.0.0',
        inputs: [
            {
                key: 'events',
                label: 'Moderation Events',
                description: 'All moderation events',
                type: 'csv',
            },
        ],
        outputs: [
            {
                key: 'moderation_score',
                label: 'Moderation Score',
                type: 'score_map',
                entity: 'content',
                description: 'Next-gen moderation scores',
            },
            {
                key: 'confidence',
                label: 'Confidence Level',
                type: 'score_map',
                entity: 'content',
                description: 'Confidence in moderation decision',
            },
        ],
    },
    'engagement_score@0.1.0': {
        key: 'engagement_score',
        name: 'Engagement Score',
        category: 'engagement',
        description: 'Beta version of engagement scoring',
        version: '0.1.0',
        inputs: [
            {
                key: 'activities',
                label: 'User Activities',
                description: 'User activity logs',
                type: 'csv',
            },
        ],
        outputs: [
            {
                key: 'engagement',
                label: 'Engagement Score',
                type: 'score_map',
                entity: 'user',
                description: 'User engagement score',
            },
        ],
    },
    'engagement_score@0.2.0': {
        key: 'engagement_score',
        name: 'Engagement Score',
        category: 'engagement',
        description: 'Improved beta with time-weighted activities',
        version: '0.2.0',
        inputs: [
            {
                key: 'activities',
                label: 'User Activities',
                description: 'User activity logs',
                type: 'csv',
            },
        ],
        outputs: [
            {
                key: 'engagement',
                label: 'Engagement Score',
                type: 'score_map',
                entity: 'user',
                description: 'Time-weighted engagement score',
            },
        ],
    },
    'engagement_score@1.0.0': {
        key: 'engagement_score',
        name: 'Engagement Score',
        category: 'engagement',
        description: 'Production-ready engagement scoring',
        version: '1.0.0',
        inputs: [
            {
                key: 'activities',
                label: 'User Activities',
                description: 'User activity logs',
                type: 'csv',
            },
        ],
        outputs: [
            {
                key: 'engagement',
                label: 'Engagement Score',
                type: 'score_map',
                entity: 'user',
                description: 'Production engagement score',
            },
        ],
    },
    'reputation_rank@1.0.0': {
        key: 'reputation_rank',
        name: 'Reputation Rank',
        category: 'reputation',
        description: 'Basic reputation ranking algorithm',
        version: '1.0.0',
        inputs: [
            {
                key: 'contributions',
                label: 'Contributions',
                description: 'User contributions data',
                type: 'csv',
            },
        ],
        outputs: [
            {
                key: 'reputation',
                label: 'Reputation Score',
                type: 'score_map',
                entity: 'user',
                description: 'User reputation scores',
            },
        ],
    },
    'voting_power@1.0.0': {
        key: 'voting_power',
        name: 'Voting Power',
        category: 'governance',
        description: 'Initial voting power calculation',
        version: '1.0.0',
        inputs: [
            {
                key: 'stakes',
                label: 'Token Stakes',
                description: 'User token stakes',
                type: 'csv',
            },
        ],
        outputs: [
            {
                key: 'voting_power',
                label: 'Voting Power',
                type: 'score_map',
                entity: 'user',
                description: 'Voting power by user',
            },
        ],
    },
    'voting_power@1.1.0': {
        key: 'voting_power',
        name: 'Voting Power',
        category: 'governance',
        description: 'Added time-lock multiplier',
        version: '1.1.0',
        inputs: [
            {
                key: 'stakes',
                label: 'Token Stakes',
                description: 'User token stakes with lock duration',
                type: 'csv',
            },
        ],
        outputs: [
            {
                key: 'voting_power',
                label: 'Voting Power',
                type: 'score_map',
                entity: 'user',
                description: 'Time-adjusted voting power',
            },
        ],
    },
    'voting_power@1.2.0': {
        key: 'voting_power',
        name: 'Voting Power',
        category: 'governance',
        description: 'Added delegation support',
        version: '1.2.0',
        inputs: [
            {
                key: 'stakes',
                label: 'Token Stakes',
                description: 'User token stakes with lock duration',
                type: 'csv',
            },
            {
                key: 'delegations',
                label: 'Delegations',
                description: 'Voting power delegations',
                type: 'csv',
            },
        ],
        outputs: [
            {
                key: 'voting_power',
                label: 'Voting Power',
                type: 'score_map',
                entity: 'user',
                description: 'Delegated voting power',
            },
        ],
    },
    'voting_power@1.3.0': {
        key: 'voting_power',
        name: 'Voting Power',
        category: 'governance',
        description: 'Added quadratic voting option',
        version: '1.3.0',
        inputs: [
            {
                key: 'stakes',
                label: 'Token Stakes',
                description: 'User token stakes',
                type: 'csv',
            },
            {
                key: 'delegations',
                label: 'Delegations',
                description: 'Voting power delegations',
                type: 'csv',
            },
        ],
        outputs: [
            {
                key: 'voting_power',
                label: 'Voting Power',
                type: 'score_map',
                entity: 'user',
                description: 'Quadratic voting power',
            },
        ],
    },
    'voting_power@2.0.0': {
        key: 'voting_power',
        name: 'Voting Power v2',
        category: 'governance',
        description: 'Major rewrite with pluggable strategies',
        version: '2.0.0',
        inputs: [
            {
                key: 'governance_data',
                label: 'Governance Data',
                description: 'All governance-related data',
                type: 'csv',
            },
        ],
        outputs: [
            {
                key: 'voting_power',
                label: 'Voting Power',
                type: 'score_map',
                entity: 'user',
                description: 'Flexible voting power',
            },
        ],
    },
    'voting_power@2.1.0': {
        key: 'voting_power',
        name: 'Voting Power v2.1',
        category: 'governance',
        description: 'Added conviction voting',
        version: '2.1.0',
        inputs: [
            {
                key: 'governance_data',
                label: 'Governance Data',
                description: 'All governance-related data',
                type: 'csv',
            },
        ],
        outputs: [
            {
                key: 'voting_power',
                label: 'Voting Power',
                type: 'score_map',
                entity: 'user',
                description: 'Conviction-based voting power',
            },
            {
                key: 'conviction',
                label: 'Conviction Level',
                type: 'score_map',
                entity: 'user',
                description: 'Voter conviction levels',
            },
        ],
    },
}
