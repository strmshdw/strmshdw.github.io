"""Compile modular static files under arch/ into a standalone single-file HTML distributable."""

from __future__ import annotations

from pathlib import Path


def build_single_file_bundle(arch_dir: Path) -> str:
    index_html = (arch_dir / "index.html").read_text(encoding="utf-8")
    themes_css = (arch_dir / "styles" / "themes.css").read_text(encoding="utf-8")
    nodes_js = (arch_dir / "js" / "nodes_and_edges.js").read_text(encoding="utf-8")
    scenarios_js = (arch_dir / "js" / "scenarios_and_tech.js").read_text(encoding="utf-8")
    renderer_js = (arch_dir / "js" / "canvas_renderer.js").read_text(encoding="utf-8")
    app_js = (arch_dir / "js" / "app.js").read_text(encoding="utf-8")

    bundled = index_html.replace(
        '<link rel="stylesheet" href="./styles/themes.css" />',
        f"<style>\n{themes_css}\n</style>",
    )
    bundled = bundled.replace(
        '<script src="./js/nodes_and_edges.js"></script>',
        f"<script>\n{nodes_js}\n</script>",
    )
    bundled = bundled.replace(
        '<script src="./js/scenarios_and_tech.js"></script>',
        f"<script>\n{scenarios_js}\n</script>",
    )
    bundled = bundled.replace(
        '<script src="./js/canvas_renderer.js"></script>',
        f"<script>\n{renderer_js}\n</script>",
    )
    bundled = bundled.replace(
        '<script src="./js/app.js"></script>',
        f"<script>\n{app_js}\n</script>",
    )
    return bundled


def main() -> None:
    arch_dir = Path(__file__).resolve().parent
    bundled = build_single_file_bundle(arch_dir)
    out_path = arch_dir / "arashikage_model_architecture.html"
    out_path.write_text(bundled, encoding="utf-8")
    print(f"Compiled standalone bundle: {out_path} ({len(bundled):,} bytes)")


if __name__ == "__main__":
    main()
