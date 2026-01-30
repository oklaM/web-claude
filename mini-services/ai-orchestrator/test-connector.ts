import { ClaudeCLIConnector } from './claude-cli';

async function test() {
  const connector = new ClaudeCLIConnector();

  connector.onMessage((msg) => {
    console.log('Received:', msg);
  });

  try {
    await connector.start();
    console.log('Connector started successfully');

    // Test sending a message
    connector.sendMessage('Hello');

    await new Promise(resolve => setTimeout(resolve, 2000));
    await connector.stop();
    console.log('Test passed');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

test();
