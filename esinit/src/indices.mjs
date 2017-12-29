export default [
	{
		index: 'user_index',
		body: {
			mappings: {
				doc: {
					properties: {
						firstName: { type: 'keyword' },
						lastName: { type: 'keyword' },
						bornOn: { type: 'date', format: 'year_month_day' },
						emails: { type: 'keyword' },
						suggest: { type: 'completion' },
					},
				},
			},
			aliases: {
				user: {},
			},
		},
	},
	{
		index: 'song_index',
		body: {
			mappings: {
				doc: {
						properties: {
								title: { type: 'text' },
								description: { type: 'text' },
								suggest: { type: 'completion' },
						},
				},
			},
			aliases: {
				song: {},
			},
		},
	},
]
