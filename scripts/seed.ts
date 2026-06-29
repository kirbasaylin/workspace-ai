// Seeds the workspace with a few demo notes so semantic search has something to
// find. Run AFTER the API server is up:  npx tsx scripts/seed.ts
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const docs = [
  {
    title: "PyTorch Project",
    content:
      "Training a vision transformer on ImageNet. Spent the week profiling GPU memory and rewriting the data loader. Mixed-precision training cut step time by 40%. TODO: benchmark against the CUDA kernel version.",
  },
  {
    title: "Summer Internship Notes",
    content:
      "Worked on accelerating inference. Wrote a custom CUDA kernel for the attention block and measured throughput on an A100. Need to email recruiter about return offer. Schedule sync with the infra team next Tuesday.",
  },
  {
    title: "CUDA Kernel Guide",
    content:
      "Notes on writing efficient GPU kernels: coalesced memory access, shared memory tiling, warp-level primitives, occupancy tuning. Avoid bank conflicts. Profile with Nsight Compute.",
  },
  {
    title: "FPGA Development Log",
    content:
      "Exploring hardware acceleration on FPGA with Verilog. Pipelining and parallelism differ a lot from GPU programming. Synthesis took forever. Deadline for the demo is 2025-08-15.",
  },
];

async function main() {
  for (const d of docs) {
    const res = await fetch(`${BASE}/pages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    });
    console.log(res.ok ? `✓ ${d.title}` : `✗ ${d.title}: ${await res.text()}`);
  }
  console.log("\nDone. Try: GET /search?q=GPU%20optimization  or ask the AI 'What have I learned about FPGA?'");
}

main();
