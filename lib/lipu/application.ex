defmodule Lipu.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Start the Ecto repository
      Lipu.Repo,
      # Start the Telemetry supervisor
      LipuWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, [name: Lipu.PubSub, adapter: Phoenix.PubSub.PG2]},
      # Start the Endpoint (http/https)
      LipuWeb.Endpoint
      # Start a worker by calling: Lipu.Worker.start_link(arg)
      # {Lipu.Worker, arg}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Lipu.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    LipuWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
