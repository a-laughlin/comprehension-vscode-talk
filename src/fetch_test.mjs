import ollama from 'ollama';

(async ()=>{
  // Configure Ollama client to connect to local Ollama server
  // ollama.({
  //   host: 'http://localhost:11434' // Default Ollama server address
  // });

  // Verify Ollama is running
  try {
    await ollama.pull({
      model: 'llama3.2:1b',
      stream: false,
    });
    console.log(await fetch('http://localhost:11434/api/version'));
  } catch (err) {
    // @ts-expect-error
    console.error('Error connecting to Ollama server:', err.message);
    console.log('Make sure Ollama is installed and running:');
    console.log('1. Install Ollama from https://ollama.ai');
    console.log('2. Start the Ollama server by running "ollama serve"');
    process.exit(1);
  }
  const response = await ollama.chat({
    model: 'llama3.2:1b',
    messages: [{ role: 'user', content: 'print only the plain text "hello world"' }],
  })
  console.log(response.message.content)



  //  // Generate text with a prompt

  //  model.generateText("Hello, how are you today?").then(response => {

  //    console.log(response.text); // Output the generated text

  //  });
  // const commitHistory = ['did stuff','did more stuff','tweaked the stuff'];
  // const response = await ollama.generate({
  //   model: 'llama3.2:1b',
  //   // template: "",
  //   // system: stripLeftPad(`
  //   //   You are mario from super mario bros.
  //   // `),
  //   prompt:(`
  //     Summarize the commit messages listed after the delimiter --------.
  //     When summarizing them, focus on:
  //     - The purpose and functionality
  //     - Key design decisions and patterns used
  //     - How it interacts with the rest of the system
  //     - Any important technical details needed to understand it
  //     Keep the explanation clear and to-the-point.

  //     --------

  //     ${commitHistory.join('\n\n--delimiter--\n\n')}
  //   `),
  //   stream:false
  // })
  // console.log('response',response);
})();



