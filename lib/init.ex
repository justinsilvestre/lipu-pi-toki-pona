# workaround as seeds.exs cannot be run via fly console
# https://community.fly.io/t/how-to-run-seeds-exs-for-elixir-phoenix-app/3591/4
defmodule GlobalSetup do
  def run(filepath) do
    alias NimbleCSV.RFC4180, as: CSV
    alias Lipu.BuildDictionary
    alias Lipu.Repo

    %{
      tp_lemmas: tp_lemmas,
      en_lemmas: en_lemmas,
      tp_parts_of_speech: tp_parts_of_speech,
      en_parts_of_speech: en_parts_of_speech,
      alternate_tp_lemmas: alternate_tp_lemmas
    } =
      filepath
      |> File.stream!()
      |> CSV.parse_stream()
      |> Enum.to_list()
      |> BuildDictionary.build()

    Enum.each(tp_parts_of_speech, fn pos ->
      Repo.get_by(LipuWeb.TpPartOfSpeech, name: pos) ||
        Repo.insert!(%LipuWeb.TpPartOfSpeech{name: pos})
    end)

    build_tp_lemma = fn entry = %{text: text, pos: pos_name}, alternate ->
      pos = Repo.get_by(LipuWeb.TpPartOfSpeech, name: pos_name)

      attrs = %{
        text: text,
        pos_id: pos.id
      }

      animacy = entry[:animacy]
      attrs = if animacy, do: Map.put(attrs, :animacy, animacy), else: attrs

      attrs =
        if alternate,
          do:
            Map.put(
              attrs,
              :primary_id,
              Repo.get_by(LipuWeb.TpLemma, text: entry[:primary], pos_id: pos.id).id
            ),
          else: attrs

      Repo.get_by(LipuWeb.TpLemma, attrs) ||
        Repo.insert!(struct(LipuWeb.TpLemma, attrs))
    end

    Enum.each(tp_lemmas, &build_tp_lemma.(&1, false))
    Enum.each(alternate_tp_lemmas, &build_tp_lemma.(&1, true))

    tp_roles = [
      "VOCATIVE",
      "PREDICATE",
      "COMPLEMENT",
      "SUBJECT",
      "INFINITIVE",
      "DIRECT_OBJECT",
      "PREPOSITIONAL_OBJECT",
      "NEGATIVE",
      "INTERROGATIVE",
      "INTERROGATIVE_REPETITION",
      "VOCATIVE_PARTICLE",
      "INDICATIVE_PARTICLE",
      "OPTATIVE_PARTICLE",
      "DIRECT_OBJECT_PARTICLE",
      "COMPOUND_COMPLEMENT_PARTICLE",
      "AND_PARTICLE",
      "OR_PARTICLE",
      "CONTEXT_PARTICLE",
      "CONTEXT_SUBJECT",
      "CONTEXT_PREDICATE"
    ]

    Enum.each(tp_roles, fn role ->
      Repo.get_by(LipuWeb.TpRole, name: role) ||
        Repo.insert!(%LipuWeb.TpRole{name: role})
    end)

    Enum.each(en_parts_of_speech, fn pos ->
      Repo.get_by(LipuWeb.EnPartOfSpeech, name: pos) ||
        Repo.insert!(%LipuWeb.EnPartOfSpeech{name: pos})
    end)

    Enum.each(
      en_lemmas,
      fn entry = %{text: text, pos: pos_name, tp: %{text: tp_text, pos: tp_pos_name}} ->
        pos = Repo.get_by(LipuWeb.EnPartOfSpeech, name: pos_name)

        en_attrs = %{
          text: text,
          pos_id: pos.id
        }

        en_lemma =
          Repo.get_by(LipuWeb.EnLemma, en_attrs) ||
            Repo.insert!(struct(LipuWeb.EnLemma, en_attrs))

        tp_lemma =
          Repo.get_by(LipuWeb.TpLemma, %{
            pos_id: Repo.get_by(LipuWeb.TpPartOfSpeech, name: tp_pos_name).id,
            text: tp_text
          })

        translation_attrs = %{en_lemma_id: en_lemma.id, tp_lemma_id: tp_lemma.id}

        Repo.get_by(LipuWeb.PhraseTranslation, translation_attrs) ||
          Repo.insert(struct(LipuWeb.PhraseTranslation, translation_attrs))
      end
    )
  end
end
