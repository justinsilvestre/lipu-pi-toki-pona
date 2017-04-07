defmodule Lipu.Repo.Migrations.CreateEnPartOfSpeech do
  use Ecto.Migration

  def change do
    create table(:en_parts_of_speech) do
      add :name, :string, size: 4, null: false

      timestamps()
    end
    create unique_index(:en_parts_of_speech, [:name])

  end
end
