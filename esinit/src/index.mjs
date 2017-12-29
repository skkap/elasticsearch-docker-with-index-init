import elasticsearch from 'elasticsearch'
import sleep from 'sleep-promise'
import chalk from 'chalk'

import indices from './indices'


(async () => {
	const echo = string => console.log(chalk.green(string))
	const warning = string => console.log(chalk.yellow(string))

	const elasticsearchHost = process.env.ES_HOST || 'localhost'
	const elasticsearchPort = process.env.ES_PORT || '9200'

	const maxWaitingSec = process.env.MAX_WAITING_SEC || 5 * 60
	const delayBetweenRequestsSec = process.env.DELAY_BETWEEN_REQUESTS_SEC || 5

	const maxWaitingMs = maxWaitingSec * 1000
	const delayBetweenRequestsMs = delayBetweenRequestsSec * 1000

	const esclient = new elasticsearch.Client({
		host: elasticsearchHost + ':' + elasticsearchPort,
		log: null,
	})

	let currentWaitingMs = 0

	while (true) {
		try {
			echo('ping ->')
			const pingResponse = await esclient.ping()
		} catch (error) {
			if (currentWaitingMs >= maxWaitingMs) {
				console.error(chalk.red('Elasticsearch is not available ' +
					`for more than ${maxWaitingSec}s.`))
				process.exit(1)
			}
			warning('Elasticsearch is not available yet. ' +
				`Waiting for another ${delayBetweenRequestsSec}s. ...`)
			await sleep(delayBetweenRequestsMs)
			currentWaitingMs += delayBetweenRequestsMs
			continue
		}
		echo('<- pong! Elasticsearch is available!')
		break
	}

	echo(`Creating ${indices.length} indices...`)

	for (let i = 0; i < indices.length; i++) {
		const index = indices[i]
		try {
			const exists = await esclient.indices.exists({
				index: index['index'],
			})
			if (exists) {
				warning(`Index ${index['index']} already exists. Skipping... `)
				continue
			}
			await esclient.indices.create(index)
		} catch (error) {
			console.error(error)
			process.exit(1)
		}
		echo(`+ Index '${index['index']}' created`)
 }
})()
