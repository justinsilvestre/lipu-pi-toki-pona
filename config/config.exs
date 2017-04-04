# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration
config :lipu,
  ecto_repos: [Lipu.Repo]

# Configures the endpoint
config :lipu, Lipu.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "pOXrDCO/1mc27MRvNizxdywplge4ZOVfbfu8z57Wx3chiKl/X6NN/3K06VXGM/1p",
  render_errors: [view: Lipu.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Lipu.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
