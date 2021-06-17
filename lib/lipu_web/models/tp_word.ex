defmodule LipuWeb.TpWord do
  use Lipu.Web, :model

  @primary_key {:id, :binary_id, []}
  @derive {Phoenix.Param, key: :id}

  schema "tp_words" do
    # field :id, Ecto.UUID
    field :before, :string
    field :after, :string
    field :context, :integer
    field :anu, :boolean, default: false
    belongs_to :lemma, LipuWeb.Lemma
    belongs_to :role, LipuWeb.Role
    belongs_to :document, LipuWeb.Document
    belongs_to :head, LipuWeb.Head
    belongs_to :parent, LipuWeb.Parent
    belongs_to :prepositional_object, LipuWeb.PrepositionalObject

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:id, :before, :after, :context, :anu])
    |> validate_required([:id, :before, :after, :context, :anu])
  end
end
