defmodule Lipu.Repo do
  use Ecto.Repo,
    otp_app: :lipu,
    adapter: Ecto.Adapters.Postgres
end
