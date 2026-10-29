import type { Project } from "@/lib/content";
import Island from "@/islands/Island";

export default function ProjectDemo({ demo }: { demo: NonNullable<Project["demo"]> }) {
  switch (demo.type) {
    case "builtin":
      return <Island name="DemoLoader" props={{ id: demo.id }} />;
    case "embed":
      return <Island name="EmbedDemo" props={{ url: demo.url, title: demo.title, height: demo.height }} />;
    case "link":
      return (
        <a href={demo.url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-black hover:bg-fg">
          {demo.label} ↗
        </a>
      );
  }
}
