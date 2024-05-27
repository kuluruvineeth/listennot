import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { CodeBlock } from "./ui/codeblock";

export default function CodeHost() {
  return (
    <div>
      <Tabs
        defaultValue="modal"
        className="w-screen xl:w-[600px] sm:w-[500px] min-h-[500px]"
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="modal">Deploy on Modal</TabsTrigger>
          <TabsTrigger value="local">Run Locally</TabsTrigger>
        </TabsList>
        <TabsContent value="modal" className="w-full text-start">
          <div>
            <p>
              One of the easiest and cheapest way to host on-demand API is via{" "}
              <Link
                className="text-green-600"
                target="_"
                href={"https://www.modal.com/"}
              >
                Modal
              </Link>
              .
            </p>
            <p>
              Once you create a free account and download the Python client,
              copy or download the base code below. It&apos;s on github too:{" "}
              <Link
                className="text-green-600"
                target="_"
                href={"https://www.modal.com/"}
              >
                Code
              </Link>
            </p>
          </div>
          <div className="max-w-lg">
            <div className="w-full py-6">
              <CodeBlock
                fileName="modal_app.py"
                language="python"
                value={`from modal import Image, Stub, method, NetworkFileSystem, asgi_app
                from fastapi import Request, FastAPI
                import tempfile
                import time
                
                MODEL_DIR = "/model"
                
                web_app = FastAPI()
                
                def download_model():
                    from huggingface_hub import snapshot_download
                    snapshot_download("openai/whisper-large-v3", local_dir=MODEL_DIR)
                
                
                image = (
                    Image.from_registry("nvidia/cuda:12.1.0-cudnn8-devel-ubuntu22.04", add_python="3.9")
                    .apt_install("git","ffmpeg")
                    .pip_install(
                        "transformers",
                        "ninja",
                        "packaging",
                        "wheel",
                          "torch",
                        "hf-transfer~=0.1",
                        "ffmpeg-python",
                    ).run_commands("python -m pip install flash-attn --no-build-isolation", gpu="A10G")
                    .env({"HF_HUB_ENABLE_HF_TRANSFER": "1"})
                    .run_function(
                        download_model,
                    )
                )
                
                stub = Stub("whisper-v3-demo", image=image)
                stub.net_file_system = NetworkFileSystem.new()
                
                @stub.cls(
                    gpu="A10G",
                    allow_concurrent_inputs=80,
                    container_idle_timeout=40,
                    network_file_systems={"/audio_files": stub.net_file_system},
                )
                class WhisperV3:
                    def __enter__(self):
                        import torch
                        from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
                        self.device = "cuda:0" if torch.cuda.is_available() else "cpu"
                        self.torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32
                        model = AutoModelForSpeechSeq2Seq.from_pretrained(
                            MODEL_DIR,
                            torch_dtype=self.torch_dtype,
                            use_safetensors=True,
                            use_flash_attention_2=True,
                        )
                        processor = AutoProcessor.from_pretrained(MODEL_DIR)
                        model.to(self.device)
                        self.pipe = pipeline(
                            "automatic-speech-recognition",
                            model=model,
                            tokenizer=processor.tokenizer,
                            feature_extractor=processor.feature_extractor,
                            max_new_tokens=128,
                            chunk_length_s=30,
                            batch_size=24,
                            return_timestamps=True,
                            torch_dtype=self.torch_dtype,
                            model_kwargs={"use_flash_attention_2": True},
                            device=0,
                        )
                
                    @method()
                    def generate(self, audio: bytes):
                        fp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
                        fp.write(audio)
                        fp.close()
                        start = time.time()
                        output = self.pipe(
                            fp.name, chunk_length_s=30, batch_size=24, return_timestamps=True
                        )
                        elapsed = time.time() - start
                        return output, elapsed
                
                @stub.function()
                @web_app.post("/")
                async def transcribe(request: Request):
                    form = await request.form()
                    audio = await form["audio"].read()
                    output, elapsed= WhisperV3().generate.remote(audio)
                    return output, elapsed
                
                @stub.function()
                @asgi_app()
                def entrypoint():
                    return web_app`}
              />
            </div>
          </div>
          <div className="prose prose-p:tracking-tight mb-6">
            <p>
              After authenticating with the Modal CLI, run this in your
              terminal:
            </p>
            <pre className="bg-gray-100 text-black border-gray-300 border-2">
              <code>
                <span className="select-none pr-3">$</span>
                {"modal deploy modal_app.py"}
              </code>
            </pre>
          </div>
          <div className="prose prose-p:tracking-tight">
            <p>
              Now you can make requests! Remember to fill in the missing info:
            </p>
            <pre className="bg-gray-100 text-black border-gray-300 border-2">
              <code>
                <span className="select-none pr-3">$</span>
                {`curl -X POST -F "audio=@<file>" https://<org_name>--whisper-v3-demo-entrypoint.modal.run`}
              </code>
            </pre>
          </div>
        </TabsContent>
        <TabsContent value="local" className="w-full text-start">
          <div className="prose prose-p:tracking-tight">
            <p>
              Run WhisperV3 easily with{" "}
              <Link href={""} target="_" className="text-orange-600">
                Insanely Fast Whisper
              </Link>
              .
            </p>
            <p>
              Install <code>insanely-fast-whisper</code> with <code>pipx</code>
            </p>
            <pre className="bg-gray-100 text-black border-gray-300 border-2">
              <code>
                <span className="select-none pr-3">$</span>pipx install
                insanely-fast-whisper
              </code>
            </pre>
            <p>
              Run inference with <code>flash attention v2</code>. Requires
              Amphere GPUS (A10G, A100, etc.) View the full requirements at the
              pypi page:{" "}
              <Link className="text-blue-600" target="_" href="">
                flash-attn
              </Link>
            </p>
            <pre className="bg-gray-100 text-black border-gray-300 border-2">
              <code>
                <span className="select-none pr-3">$</span>
                {
                  "insanely-fast-whisper --file-name <filename or URL> --flash True"
                }
              </code>
            </pre>
            <p>
              If you don&apos; have an Amphere GPU, you can still run WhisperV3
              without flash attention.
            </p>
            <pre className="bg-gray-100 text-black border-gray-300 border-2">
              <code>
                <span className="select-none pr-3">$</span>
                {"insanely-fast-whisper --file-name <filename or URL>"}
              </code>
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
