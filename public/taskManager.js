// TaskManager Class - Handles task queue and execution with timeout options
class TaskManager {
    constructor() {
        this.tasks = [];
        this.running = false;
        this.aiOutputFormat = null;
    }

    /**
     * Add a task to the queue
     * @param {Function} taskFn - The function to execute
     * @param {Object} options - Task options
     * @param {number} [options.timeout=0] - Timeout in ms (0 = immediate execution)
     * @param {boolean} [options.useAI=false] - Whether this task uses AI
     * @param {Object} [options.aiParams={}] - Parameters for AI processing
     * @param {string} [options.aiOutputFormat=null] - Required format for AI output
     * @param {number} [options.priority=0] - Task priority (higher = more important)
     * @returns {number} Task ID
     */
    addTask(taskFn, options = {}) {
        const defaultOptions = {
            timeout: 0,
            useAI: false,
            aiParams: {},
            aiOutputFormat: this.aiOutputFormat,
            priority: 0
        };

        const taskOptions = { ...defaultOptions, ...options };
        const taskId = Date.now() + Math.random();

        this.tasks.push({
            id: taskId,
            fn: taskFn,
            options: taskOptions,
            status: 'pending'
        });

        // Sort tasks by priority (higher first)
        this.tasks.sort((a, b) => b.options.priority - a.options.priority);

        // Start processing if not already running
        if (!this.running) {
            this.processNextTask();
        }

        return taskId;
    }

    /**
     * Set default AI output format for all tasks
     * @param {string} format - Format specification
     */
    setAIOutputFormat(format) {
        this.aiOutputFormat = format;
    }

    /**
     * Process the next task in the queue
     * @private
     */
    processNextTask() {
        if (this.tasks.length === 0) {
            this.running = false;
            return;
        }

        this.running = true;
        const task = this.tasks.shift();
        task.status = 'processing';

        const executeTask = async () => {
            try {
                let result;
                
                if (task.options.useAI) {
                    // Handle AI-specific processing
                    result = await this.processAITask(task);
                } else {
                    // Regular task execution
                    result = await task.fn();
                }
                
                task.status = 'completed';
                task.result = result;
                
                // Emit completion event
                this.onTaskComplete(task);
            } catch (error) {
                task.status = 'failed';
                task.error = error;
                
                // Emit error event
                this.onTaskError(task, error);
            } finally {
                // Process next task
                this.processNextTask();
            }
        };

        if (task.options.timeout > 0) {
            // Schedule with timeout
            setTimeout(executeTask, task.options.timeout);
        } else {
            // Execute immediately
            executeTask();
        }
    }

    /**
     * Process an AI-specific task
     * @param {Object} task - The task to process
     * @private
     */
    async processAITask(task) {
        const { aiParams, aiOutputFormat } = task.options;
        
        // If the task has a specific format requirement, use it
        const outputFormat = aiOutputFormat || this.aiOutputFormat;
        
        // Add format requirements to AI parameters if specified
        const enhancedParams = { ...aiParams };
        if (outputFormat) {
            enhancedParams.outputFormat = outputFormat;
        }
        
        // Execute the AI task with enhanced parameters
        return await task.fn(enhancedParams);
    }

    /**
     * Event handler for task completion
     * @param {Object} task - The completed task
     */
    onTaskComplete(task) {
        // Default implementation - override this in your application
        console.log(`Task ${task.id} completed with result:`, task.result);
    }

    /**
     * Event handler for task errors
     * @param {Object} task - The failed task
     * @param {Error} error - The error that occurred
     */
    onTaskError(task, error) {
        // Default implementation - override this in your application
        console.error(`Task ${task.id} failed with error:`, error);
    }

    /**
     * Cancel a specific task by ID
     * @param {number} taskId - The ID of the task to cancel
     * @returns {boolean} Whether the task was found and cancelled
     */
    cancelTask(taskId) {
        const index = this.tasks.findIndex(task => task.id === taskId);
        if (index !== -1) {
            this.tasks.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Clear all pending tasks
     */
    clearTasks() {
        this.tasks = [];
    }

    /**
     * Get the current status of all tasks
     * @returns {Object} Task status information
     */
    getStatus() {
        return {
            running: this.running,
            pendingTasks: this.tasks.length,
            tasks: this.tasks.map(task => ({
                id: task.id,
                status: task.status,
                priority: task.options.priority,
                timeout: task.options.timeout,
                useAI: task.options.useAI
            }))
        };
    }
}

// Example AI action creator
class AIActionCreator {
    constructor(apiKey, model = 'gpt-3.5-turbo') {
        this.apiKey = apiKey;
        this.model = model;
    }

    /**
     * Create an AI action function that can be added to the task manager
     * @param {string} prompt - The prompt to send to the AI
     * @param {Object} options - AI options
     * @returns {Function} A function that can be passed to TaskManager.addTask
     */
    createAction(prompt, options = {}) {
        return async (aiParams = {}) => {
            // Combine the base prompt with any dynamic content
            const enhancedPrompt = this._enhancePrompt(prompt, aiParams);
            
            // Add output format instructions if specified
            const formattedPrompt = this._addFormatInstructions(enhancedPrompt, aiParams.outputFormat);
            
            // In a real implementation, this would call an AI API
            console.log(`Sending to AI: ${formattedPrompt}`);
            
            // Simulate AI processing
            return this._simulateAIResponse(formattedPrompt, aiParams.outputFormat);
        };
    }

    /**
     * Enhance the prompt with dynamic parameters
     * @param {string} basePrompt - The original prompt
     * @param {Object} params - Parameters to inject
     * @private
     */
    _enhancePrompt(basePrompt, params) {
        let enhancedPrompt = basePrompt;
        
        // Replace any parameter placeholders in the prompt
        Object.entries(params).forEach(([key, value]) => {
            enhancedPrompt = enhancedPrompt.replace(`{{${key}}}`, value);
        });
        
        return enhancedPrompt;
    }

    /**
     * Add format instructions to the prompt
     * @param {string} prompt - The prompt to format
     * @param {string} format - The required output format
     * @private
     */
    _addFormatInstructions(prompt, format) {
        if (!format) return prompt;
        
        return `${prompt}\n\nPlease format your response as ${format}.`;
    }

    /**
     * Simulate an AI response (for demonstration)
     * @param {string} prompt - The prompt sent to AI
     * @param {string} format - The required output format
     * @private
     */
    _simulateAIResponse(prompt, format) {
        // This is just a simulation - in a real app, you'd call an actual AI API
        const response = {
            text: `This is a simulated AI response to: "${prompt.substring(0, 50)}..."`,
            timestamp: new Date().toISOString()
        };
        
        // Format the response according to the requested format
        if (format === 'json') {
            return response;
        } else if (format === 'markdown') {
            return `# AI Response\n\n${response.text}\n\n*Generated at ${response.timestamp}*`;
        } else if (format === 'html') {
            return `<div class="ai-response"><h1>AI Response</h1><p>${response.text}</p><small>Generated at ${response.timestamp}</small></div>`;
        } else {
            return response.text;
        }
    }
}

// Usage example
function demoTaskManager() {
    // Create a task manager
    const taskManager = new TaskManager();
    
    // Set a default AI output format
    taskManager.setAIOutputFormat('json');
    
    // Create an AI action creator (in a real app, you'd provide your API key)
    const aiCreator = new AIActionCreator('your-api-key-here');
    
    // Add a regular task to execute immediately
    taskManager.addTask(() => {
        console.log('Executing immediate task');
        return 'Immediate task completed';
    });
    
    // Add a task with a timeout
    taskManager.addTask(() => {
        console.log('Executing delayed task');
        return 'Delayed task completed';
    }, { timeout: 2000 });
    
    // Create an AI action and add it as a high-priority task
    const aiAction = aiCreator.createAction('Analyze the following data: {{data}}');
    taskManager.addTask(aiAction, {
        useAI: true,
        aiParams: { data: 'Sample data for analysis' },
        aiOutputFormat: 'markdown', // Override the default format
        priority: 10,
        timeout: 1000
    });
    
    // Override the completion handler for custom processing
    taskManager.onTaskComplete = (task) => {
        console.log(`Custom handler: Task ${task.id} completed`);
        console.log('Result:', task.result);
    };
}

// Export the classes
export { TaskManager, AIActionCreator };