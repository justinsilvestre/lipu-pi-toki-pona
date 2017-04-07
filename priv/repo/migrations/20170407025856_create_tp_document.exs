defmodule Lipu.Repo.Migrations.CreateTpDocument do
  use Ecto.Migration

  def change do
    create table(:tp_documents) do
      add :tp_word_ids, {:array, :uuid}, null: false

      timestamps()
    end

  end
end
