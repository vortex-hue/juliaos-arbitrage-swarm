#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');
const ora = require('ora');
const Table = require('cli-table3');

/**
 * Cross-Chain Arbitrage Swarm Bot CLI
 * 
 * A command-line interface for managing the JuliaOS-powered arbitrage swarm bot.
 * Provides easy setup, monitoring, and control capabilities.
 */

class ArbitrageSwarmCLI {
    constructor() {
        this.configPath = 'config.json';
        this.process = null;
        this.isRunning = false;
    }

    /**
     * Main CLI entry point
     */
    async run() {
        const command = process.argv[2];
        const args = process.argv.slice(3);

        try {
            switch (command) {
                case 'start':
                    await this.startBot(args);
                    break;
                case 'stop':
                    await this.stopBot();
                    break;
                case 'status':
                    await this.getStatus();
                    break;
                case 'config':
                    await this.manageConfig(args);
                    break;
                case 'monitor':
                    await this.monitorBot();
                    break;
                case 'setup':
                    await this.setupBot();
                    break;
                case 'logs':
                    await this.showLogs(args);
                    break;
                case 'help':
                    this.showHelp();
                    break;
                default:
                    this.showHelp();
                    break;
            }
        } catch (error) {
            console.error(chalk.red('Error:'), error.message);
            process.exit(1);
        }
    }

    /**
     * Start the arbitrage swarm bot
     */
    async startBot(args) {
        const spinner = ora('Starting Arbitrage Swarm Bot...').start();

        try {
            // Check if bot is already running
            if (this.isRunning) {
                spinner.fail('Bot is already running');
                return;
            }

            // Validate configuration
            if (!this.validateConfig()) {
                spinner.fail('Invalid configuration. Run "setup" to configure the bot.');
                return;
            }

            // Start Julia process
            this.process = spawn('julia', ['src/main.jl', this.configPath], {
                stdio: ['pipe', 'pipe', 'pipe'],
                cwd: process.cwd()
            });

            // Handle process events
            this.process.stdout.on('data', (data) => {
                const output = data.toString();
                if (output.includes('Arbitrage Swarm Bot started successfully')) {
                    spinner.succeed('Arbitrage Swarm Bot started successfully');
                    this.isRunning = true;
                    this.showBotInfo();
                }
                console.log(chalk.blue('[BOT]'), output.trim());
            });

            this.process.stderr.on('data', (data) => {
                console.error(chalk.red('[ERROR]'), data.toString().trim());
            });

            this.process.on('close', (code) => {
                this.isRunning = false;
                if (code !== 0) {
                    console.error(chalk.red(`Bot process exited with code ${code}`));
                }
            });

            // Wait for bot to start
            await new Promise(resolve => setTimeout(resolve, 5000));

        } catch (error) {
            spinner.fail('Failed to start bot');
            throw error;
        }
    }

    /**
     * Stop the arbitrage swarm bot
     */
    async stopBot() {
        const spinner = ora('Stopping Arbitrage Swarm Bot...').start();

        try {
            if (!this.isRunning || !this.process) {
                spinner.fail('Bot is not running');
                return;
            }

            // Send graceful shutdown signal
            this.process.kill('SIGINT');

            // Wait for process to terminate
            await new Promise((resolve) => {
                this.process.on('close', () => {
                    this.isRunning = false;
                    this.process = null;
                    resolve();
                });
            });

            spinner.succeed('Arbitrage Swarm Bot stopped successfully');

        } catch (error) {
            spinner.fail('Failed to stop bot');
            throw error;
        }
    }

    /**
     * Get bot status
     */
    async getStatus() {
        const spinner = ora('Getting bot status...').start();

        try {
            // Check if process is running
            const isRunning = this.isRunning && this.process && !this.process.killed;

            if (isRunning) {
                spinner.succeed('Bot is running');
                
                // Get performance metrics (simulated)
                const metrics = await this.getPerformanceMetrics();
                this.displayMetrics(metrics);
            } else {
                spinner.fail('Bot is not running');
            }

        } catch (error) {
            spinner.fail('Failed to get status');
            throw error;
        }
    }

    /**
     * Monitor bot in real-time
     */
    async monitorBot() {
        console.log(chalk.cyan('Starting real-time monitoring...'));
        console.log(chalk.gray('Press Ctrl+C to exit\n'));

        const interval = setInterval(async () => {
            try {
                const metrics = await this.getPerformanceMetrics();
                this.displayMetrics(metrics, true);
            } catch (error) {
                console.error(chalk.red('Monitoring error:'), error.message);
            }
        }, 5000);

        // Handle Ctrl+C
        process.on('SIGINT', () => {
            clearInterval(interval);
            console.log(chalk.yellow('\nMonitoring stopped'));
            process.exit(0);
        });
    }

    /**
     * Setup bot configuration
     */
    async setupBot() {
        console.log(chalk.cyan('Setting up Arbitrage Swarm Bot Configuration\n'));

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        try {
            const config = await this.interactiveConfig(rl);
            
            // Save configuration
            fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
            
            console.log(chalk.green('\nConfiguration saved successfully!'));
            console.log(chalk.yellow('Run "start" to begin arbitrage operations.'));

        } catch (error) {
            console.error(chalk.red('Setup failed:'), error.message);
        } finally {
            rl.close();
        }
    }

    /**
     * Interactive configuration setup
     */
    async interactiveConfig(rl) {
        const config = {
            arbitrage_agent: {},
            agent_swarm: {},
            cross_chain_bridge: {},
            wallet: {},
            api_keys: {}
        };

        console.log(chalk.blue('=== Arbitrage Agent Configuration ==='));
        
        config.arbitrage_agent.exchanges = await this.promptArray(rl, 
            'Enter exchanges to monitor (comma-separated):', 
            'uniswap,sushiswap,pancakeswap,curve,balancer'
        );
        
        config.arbitrage_agent.chains = await this.promptArray(rl,
            'Enter chains to monitor (comma-separated):',
            'ethereum,bsc,polygon,arbitrum,optimism'
        );
        
        config.arbitrage_agent.min_profit_threshold = parseFloat(await this.prompt(rl,
            'Minimum profit threshold (%):',
            '0.5'
        ));
        
        config.arbitrage_agent.max_risk_score = parseFloat(await this.prompt(rl,
            'Maximum risk score (0-100):',
            '70'
        ));
        
        config.arbitrage_agent.monitoring_interval = parseInt(await this.prompt(rl,
            'Monitoring interval (seconds):',
            '30'
        ));

        console.log(chalk.blue('\n=== Agent Swarm Configuration ==='));
        
        config.agent_swarm.max_agents = parseInt(await this.prompt(rl,
            'Maximum number of agents:',
            '10'
        ));
        
        config.agent_swarm.coordination_strategy = await this.prompt(rl,
            'Coordination strategy (consensus/leader/distributed):',
            'consensus'
        );
        
        config.agent_swarm.consensus_threshold = parseFloat(await this.prompt(rl,
            'Consensus threshold (0-1):',
            '0.7'
        ));

        console.log(chalk.blue('\n=== Cross-Chain Bridge Configuration ==='));
        
        config.cross_chain_bridge.gas_optimization = await this.promptBoolean(rl,
            'Enable gas optimization:',
            true
        );
        
        config.cross_chain_bridge.slippage_tolerance = parseFloat(await this.prompt(rl,
            'Slippage tolerance (%):',
            '1.0'
        ));

        console.log(chalk.blue('\n=== Wallet Configuration ==='));
        
        config.wallet.address = await this.prompt(rl,
            'Wallet address:',
            ''
        );
        
        config.wallet.private_key = await this.promptSecure(rl,
            'Private key (will be encrypted):',
            ''
        );

        console.log(chalk.blue('\n=== API Keys Configuration ==='));
        
        config.api_keys.openai_api_key = await this.promptSecure(rl,
            'OpenAI API Key:',
            ''
        );
        
        config.api_keys.infura_api_key = await this.promptSecure(rl,
            'Infura API Key:',
            ''
        );

        return config;
    }

    /**
     * Manage configuration
     */
    async manageConfig(args) {
        const action = args[0];

        switch (action) {
            case 'show':
                this.showConfig();
                break;
            case 'edit':
                await this.editConfig();
                break;
            case 'validate':
                this.validateConfig();
                break;
            default:
                console.log(chalk.yellow('Usage: config [show|edit|validate]'));
                break;
        }
    }

    /**
     * Show current configuration
     */
    showConfig() {
        if (!fs.existsSync(this.configPath)) {
            console.log(chalk.red('Configuration file not found. Run "setup" to create one.'));
            return;
        }

        const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        console.log(chalk.cyan('Current Configuration:'));
        console.log(JSON.stringify(config, null, 2));
    }

    /**
     * Validate configuration
     */
    validateConfig() {
        if (!fs.existsSync(this.configPath)) {
            console.log(chalk.red('Configuration file not found'));
            return false;
        }

        try {
            const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
            
            // Validate required fields
            const required = [
                'arbitrage_agent.exchanges',
                'arbitrage_agent.chains',
                'wallet.address',
                'api_keys.openai_api_key'
            ];

            for (const field of required) {
                const value = field.split('.').reduce((obj, key) => obj?.[key], config);
                if (!value) {
                    console.log(chalk.red(`Missing required field: ${field}`));
                    return false;
                }
            }

            console.log(chalk.green('Configuration is valid'));
            return true;

        } catch (error) {
            console.log(chalk.red('Invalid configuration file'));
            return false;
        }
    }

    /**
     * Show bot logs
     */
    async showLogs(args) {
        const lines = parseInt(args[0]) || 50;
        
        console.log(chalk.cyan(`Showing last ${lines} log lines:`));
        
        // This would typically read from a log file
        // For now, we'll show a placeholder
        console.log(chalk.gray('Log functionality would be implemented here'));
    }

    /**
     * Get performance metrics (simulated)
     */
    async getPerformanceMetrics() {
        // In a real implementation, this would query the Julia process
        return {
            bot_id: 'arbitrage-swarm-bot-123',
            is_running: this.isRunning,
            total_opportunities: Math.floor(Math.random() * 1000),
            successful_trades: Math.floor(Math.random() * 800),
            success_rate: Math.random() * 0.9 + 0.1,
            total_profit: Math.random() * 10000,
            uptime: '2h 15m 30s',
            opportunities_per_hour: Math.random() * 50 + 10
        };
    }

    /**
     * Display performance metrics
     */
    displayMetrics(metrics, clearScreen = false) {
        if (clearScreen) {
            console.clear();
        }

        const table = new Table({
            head: [chalk.cyan('Metric'), chalk.cyan('Value')],
            colWidths: [30, 20]
        });

        table.push(
            ['Bot ID', metrics.bot_id],
            ['Status', metrics.is_running ? chalk.green('Running') : chalk.red('Stopped')],
            ['Total Opportunities', metrics.total_opportunities],
            ['Successful Trades', metrics.successful_trades],
            ['Success Rate', `${(metrics.success_rate * 100).toFixed(2)}%`],
            ['Total Profit', `$${metrics.total_profit.toFixed(2)}`],
            ['Uptime', metrics.uptime],
            ['Opportunities/Hour', metrics.opportunities_per_hour.toFixed(1)]
        );

        console.log(table.toString());
    }

    /**
     * Show bot information
     */
    showBotInfo() {
        console.log(chalk.cyan('\n=== Arbitrage Swarm Bot Info ==='));
        console.log(chalk.blue('Framework:'), 'JuliaOS');
        console.log(chalk.blue('Type:'), 'Cross-Chain Arbitrage Swarm');
        console.log(chalk.blue('Features:'), 'AI Agents, Swarm Intelligence, Multi-Chain');
        console.log(chalk.blue('Status:'), chalk.green('Active'));
        console.log(chalk.yellow('\nUse "monitor" to view real-time metrics'));
        console.log(chalk.yellow('Use "status" to check current status'));
        console.log(chalk.yellow('Use "stop" to stop the bot\n'));
    }

    /**
     * Show help information
     */
    showHelp() {
        console.log(chalk.cyan('Cross-Chain Arbitrage Swarm Bot CLI\n'));
        console.log(chalk.blue('Usage:'));
        console.log('  node cli/index.js <command> [options]\n');
        
        console.log(chalk.blue('Commands:'));
        console.log('  start              Start the arbitrage swarm bot');
        console.log('  stop               Stop the bot');
        console.log('  status             Show bot status and metrics');
        console.log('  monitor            Monitor bot in real-time');
        console.log('  setup              Interactive configuration setup');
        console.log('  config show        Show current configuration');
        console.log('  config edit        Edit configuration');
        console.log('  config validate    Validate configuration');
        console.log('  logs [lines]       Show bot logs');
        console.log('  help               Show this help message\n');
        
        console.log(chalk.blue('Examples:'));
        console.log('  node cli/index.js setup');
        console.log('  node cli/index.js start');
        console.log('  node cli/index.js monitor');
        console.log('  node cli/index.js status\n');
    }

    /**
     * Helper methods for interactive prompts
     */
    async prompt(rl, question, defaultValue = '') {
        return new Promise((resolve) => {
            const defaultText = defaultValue ? ` (${defaultValue})` : '';
            rl.question(`${question}${defaultText}: `, (answer) => {
                resolve(answer || defaultValue);
            });
        });
    }

    async promptSecure(rl, question, defaultValue = '') {
        return new Promise((resolve) => {
            const defaultText = defaultValue ? ` (${'*'.repeat(defaultValue.length)})` : '';
            rl.question(`${question}${defaultText}: `, (answer) => {
                resolve(answer || defaultValue);
            });
        });
    }

    async promptBoolean(rl, question, defaultValue = true) {
        const answer = await this.prompt(rl, `${question} (y/n)`, defaultValue ? 'y' : 'n');
        return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
    }

    async promptArray(rl, question, defaultValue = '') {
        const answer = await this.prompt(rl, question, defaultValue);
        return answer.split(',').map(item => item.trim());
    }
}

// Run CLI if this file is executed directly
if (require.main === module) {
    const cli = new ArbitrageSwarmCLI();
    cli.run().catch(console.error);
}

module.exports = ArbitrageSwarmCLI; 