import { Command } from './command.js';
import ping from './ping.js';
import echo from './echo.js';
import currency from './currency.js';
import remind from './remind.js';

const commands: Command[] = [...ping, ...echo, ...currency, ...remind];

export default commands;
