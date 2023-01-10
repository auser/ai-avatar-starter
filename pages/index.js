import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import buildspaceLogo from "../assets/buildspace-logo.png";


const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const Home = () => {

  const maxRetries = 20;
  const [input, setInput] = useState('')
  const [img, setImg] = useState('')

  const [retry, setRetry] = useState(0);
  const [retryCount, setRetryCount] = useState(maxRetries)
  const [isGenerating, setIsGenerating] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState('');



  const onChange = (evt) => {
    setInput(evt.target.value)
  }

  const generateAction = async () => {
    console.log("Generating...")

    if (isGenerating && retry === 0) return;

    setIsGenerating(true);

    if (retry > 0) {
      setRetryCount((prev) => {
        if (prev === 0) {
          return 0;
        } else {
          return prev - 1;
        }
      });

      setRetry(0);
    }

    const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'image/jpeg',
    },
    body: JSON.stringify({ input }),
  });

  const data = await response.json();

  if (response.status === 503) {
    console.log("Model is still loading...")
    setRetry(data.estimated_time)
    return;
  }


  if (!response.ok) {
    console.log(`Error: ${data.error}`)
    return;
  }

  // Set final prompt here
    setFinalPrompt(input);
    // Remove content from input box
    setInput('');
    setImg(data.image);
    setIsGenerating(false);
  }

  useEffect(() => {
    const runRetry = async () => {
      if (retryCount === 0) {
        console.log(`Model still loading after ${maxRetries} retries. Try again in 5`);
        setRetryCount(maxRetries);
        return;
      }

      console.log(`Trying again in ${retry} seconds`);

      await sleep(retry * 1000);
      await generateAction();
    };

    if (retry === 0) {
      return;
    }

    runRetry();
  }, [retry])

  return (
    <div className="root">
      <Head>
        <title>AI Avatar Generator | buildspace</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>Generate a set of photos</h1>
          </div>
          <div className="header-subtitle">
            <h2>Turn me into anyone you want (using "ari") in the name</h2>
          </div>
          <div className="prompt-container">
            <input type="text" className="prompt-box" value={input} onChange={onChange} />
            <div className="prompt-buttons">
              <a className={isGenerating ? "generate-button loading" : 'generate-button'} onClick={generateAction}>
                <div className="generate">
                  {isGenerating ? (<span className="loader" />) : (
                  <p>Generate</p>
                  )}
                </div>
              </a>
            </div>
          </div>
        </div>
        {img && (
      <div className="output-content">
        <Image src={img} width={512} height={512} alt={input} />
        <p>{finalPrompt}</p>
      </div>
    )}
      </div>
     
    </div>
  );
};

export default Home;
