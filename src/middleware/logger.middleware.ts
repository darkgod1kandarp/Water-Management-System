import { Request, Response, NextFunction } from 'express';
import chalk from 'chalk';
import getLogger  from '../utils/logger';

// Global variable declaration
const logger = getLogger();

const Logger = (req: Request, res: Response, next: NextFunction) => {
	logger.info(
		`${req.method} ${req.path} ${req.ip} ${req.headers['user-agent']}`,
	);

	switch (req.method) {
		case 'GET':
			console.log(
				chalk.green(req.method),
				chalk.blue(req.path),
				chalk.yellow(req.ip),
				chalk.magenta(req.headers['user-agent']),
			);
			break;
		case 'POST':
			console.log(
				chalk.cyan(req.method),
				chalk.blue(req.path),
				chalk.yellow(req.ip),
				chalk.magenta(req.headers['user-agent']),
			);
			break;
		case 'PUT':
			console.log(
				chalk.yellow(req.method),
				chalk.blue(req.path),
				chalk.yellow(req.ip),
				chalk.magenta(req.headers['user-agent']),
			);
			break;
		case 'DELETE':
			console.log(
				chalk.red(req.method),
				chalk.blue(req.path),
				chalk.yellow(req.ip),
				chalk.magenta(req.headers['user-agent']),
			);
			break;
		default:
			console.log(
				chalk.green(req.method),
				chalk.blue(req.path),
				chalk.yellow(req.ip),
				chalk.magenta(req.headers['user-agent']),
			);
	}
	next();
}

export {Logger , logger};