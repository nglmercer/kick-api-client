// Example usage of TaskManager and AIActionCreator
import { TaskManager, AIActionCreator } from './taskManager.js';

// Create a task manager instance
const taskManager = new TaskManager();

// Set a default AI output format for all AI tasks
taskManager.setAIOutputFormat('json');

// Create an AI action creator (in a real app, you'd use your actual API key)
const aiCreator = new AIActionCreator('your-api-key-here');

// Example 1: Simple immediate task
taskManager.addTask(() => {
    console.log('Executing a simple immediate task');
    return 'Simple task completed';
});

// Example 2: Delayed task with timeout
taskManager.addTask(() => {
    console.log('Executing a delayed task');
    return 'Delayed task completed';
}, { 
    timeout: 2000, // 2 seconds delay
    priority: 5 // Medium priority
});

// Example 3: High priority AI task
const analyzeDataAction = aiCreator.createAction('Analyze the following Kick.com stream data: {{data}}');
taskManager.addTask(analyzeDataAction, {
    useAI: true,
    aiParams: { 
        data: 'Viewer count: 1250, Chat messages: 320/min, Subscription rate: 5/hour' 
    },
    priority: 10, // High priority
    timeout: 1000 // 1 second delay
});

// Example 4: Low priority AI task with custom output format
const generateContentAction = aiCreator.createAction('Generate a welcome message for a new Kick.com subscriber named {{name}}');
taskManager.addTask(generateContentAction, {
    useAI: true,
    aiParams: { name: 'KickFan123' },
    aiOutputFormat: 'markdown', // Override the default format
    priority: 1, // Low priority
    timeout: 3000 // 3 seconds delay
});

// Custom completion handler
taskManager.onTaskComplete = (task) => {
    console.log(`Task ${task.id} completed with status: ${task.status}`);
    console.log('Result:', task.result);
    
    // Example of using the result in the Kick API context
    if (task.options.useAI && task.status === 'completed') {
        console.log('Processing AI result for Kick.com integration...');
        // Here you could send the AI-generated content to chat, update stream info, etc.
    }
};

// Custom error handler
taskManager.onTaskError = (task, error) => {
    console.error(`Task ${task.id} failed with error:`, error);
    console.error('Task details:', task.options);
};

// Example of scheduling periodic tasks
function schedulePeriodicTasks() {
    // Schedule a task to analyze stream metrics every 5 minutes
    setInterval(() => {
        const analyzeMetricsAction = aiCreator.createAction('Analyze the following stream metrics: {{metrics}}');
        taskManager.addTask(analyzeMetricsAction, {
            useAI: true,
            aiParams: { 
                metrics: `Timestamp: ${new Date().toISOString()}, Viewers: ${Math.floor(Math.random() * 2000)}` 
            },
            priority: 8
        });
    }, 300000); // 5 minutes
    
    // Schedule a task to check for new subscribers every minute
    setInterval(() => {
        taskManager.addTask(() => {
            console.log('Checking for new subscribers...');
            // In a real app, this would call the Kick API
            return { newSubscribers: Math.floor(Math.random() * 3) };
        }, { priority: 7 });
    }, 60000); // 1 minute
}

// Example of integrating with the Kick API
function integrateWithKickAPI() {
    // Import the KickAPI from index.js
    import('./index.js').then(module => {
        const kickAPI = new module.KickAPI();
        
        // Task to update stream title using AI
        const generateTitleAction = aiCreator.createAction('Generate an engaging stream title about {{topic}}');
        taskManager.addTask(generateTitleAction, {
            useAI: true,
            aiParams: { topic: 'gaming highlights and viewer interaction' },
            aiOutputFormat: 'text',
            priority: 9,
            timeout: 1000
        }).then(taskId => {
            // This would be handled by the onTaskComplete handler
            // which could then use the result to update the stream title
            console.log(`AI stream title generation task scheduled with ID: ${taskId}`);
        });
        
        // Example of using the task result to update channel info
        const originalOnTaskComplete = taskManager.onTaskComplete;
        taskManager.onTaskComplete = (task) => {
            // Call the original handler
            originalOnTaskComplete(task);
            
            // Additional processing for specific task types
            if (task.options.useAI && task.options.aiParams.topic && task.status === 'completed') {
                console.log('Updating stream title with AI-generated content...');
                kickAPI.updateChannel({
                    streamTitle: task.result
                }).then(success => {
                    console.log('Stream title update:', success ? 'successful' : 'failed');
                });
            }
        };
    });
}

// Uncomment to enable periodic tasks
// schedulePeriodicTasks();

// Uncomment to enable Kick API integration
// integrateWithKickAPI();

// Export for use in other files
export { taskManager, aiCreator };