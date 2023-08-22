defmodule Lipu.MixProject do
  use Mix.Project

  def project do
    [app: :lipu,
     version: "0.0.1",
     elixir: "~> 1.12",
     elixirc_paths: elixirc_paths(Mix.env),
     compilers: [] ++ Mix.compilers(),
     build_embedded: Mix.env == :prod,
     start_permanent: Mix.env == :prod,
     aliases: aliases(),
     deps: deps()]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [
      mod: {Lipu.Application, []},
      extra_applications: [:logger, :runtime_tools]
    ]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_),     do: ["lib"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [{:phoenix, "~> 1.6.15"},
    {:phoenix_ecto, "~> 4.4"},
    {:ecto_sql, "~> 3.6"},
    {:phoenix_pubsub, "~> 2.0"},
    {:postgrex, ">= 0.0.0"},
    {:phoenix_live_view, "~> 0.17.5"},
    {:plug_cowboy, "~> 2.5"},
    {:floki, ">= 0.30.0", only: :test},
    {:phoenix_html, "~> 3.0"},
    {:phoenix_live_reload, "~> 1.2", only: :dev},
    {:gettext, "~> 0.18"},
    {:nimble_csv, "~> 0.1.0"},
    {:phoenix_live_dashboard, "~> 0.6"},
    {:telemetry_metrics, "~> 0.6"},
    {:telemetry_poller, "~> 1.0"},
    {:jason, "~> 1.2"},
    {:esbuild, "~> 0.4", runtime: Mix.env() == :dev}
    ]
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, to create, migrate and run the seeds file at once:
  #
  #     $ mix ecto.setupmsgid "should be %{count} character(s)
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    ["ecto.setup": ["ecto.create", "ecto.migrate", "cmd npm install --prefix assets", "run priv/repo/seeds.exs"],
     "ecto.reset": ["ecto.drop", "ecto.setup"],
     test: ["ecto.create --quiet", "ecto.migrate", "test"],
     "assets.deploy": ["cmd npm --prefix assets install", "esbuild default --minify", "phx.digest"]
    ]
  end
end
