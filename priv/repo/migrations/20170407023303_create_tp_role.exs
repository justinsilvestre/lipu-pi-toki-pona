defmodule Lipu.Repo.Migrations.CreateTpRole do
  use Ecto.Migration

  def change do
    create table(:tp_roles) do
      add :name, :string

      timestamps()
    end

    create unique_index(:tp_roles, [:name])
  end
end
