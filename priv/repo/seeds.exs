# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     Lipu.Repo.insert!(%Lipu.SomeModel{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

# add TP parts of speech
# add TP lemmas
# add TP roles

# add EN parts of speech
# add EN lemmas

# add word translations

alias NimbleCSV.RFC4180, as: CSV
alias Lipu.BuildDictionary
alias Lipu.Repo

%{
  tp_lemmas: tp_lemmas,
  en_lemmas: en_lemmas,
  tp_parts_of_speech: tp_parts_of_speech,
  en_parts_of_speech: en_parts_of_speech,
  alternate_tp_lemmas: alternate_tp_lemmas
} = "priv/repo/wordList.csv"
  |> File.stream!
  |> CSV.parse_stream
  |> Enum.to_list
  |> BuildDictionary.build
Enum.each(tp_parts_of_speech, fn pos ->
  Repo.get_by(Lipu.TpPartOfSpeech, name: pos)
  || Repo.insert!(%Lipu.TpPartOfSpeech{name: pos}) end)

build_tp_lemma = fn (entry = %{text: text, pos: pos_name}, alternate) ->
  pos = Repo.get_by(Lipu.TpPartOfSpeech, name: pos_name)

  attrs =  %{
    text: text,
    pos_id: pos.id
  }
  animacy = entry[:animacy]
  attrs = if animacy, do: Map.put(attrs, :animacy, animacy), else: attrs
  attrs = if alternate, do: Map.put(attrs, :primary_id,
    Repo.get_by(Lipu.TpLemma, text: entry[:primary], pos_id: pos.id).id
    ), else: attrs

  Repo.get_by(Lipu.TpLemma, attrs)
    || Repo.insert!(struct(Lipu.TpLemma, attrs))
end

Enum.each(tp_lemmas, &(build_tp_lemma.(&1, false)))
Enum.each(alternate_tp_lemmas, &(build_tp_lemma.(&1, true)))

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
  "CONTEXT_PREDICATE",
]
Enum.each(tp_roles, fn role ->
  Repo.get_by(Lipu.TpRole, name: role)
  || Repo.insert!(%Lipu.TpRole{name: role}) end)

Enum.each(en_parts_of_speech, fn pos ->
  Repo.get_by(Lipu.EnPartOfSpeech, name: pos)
  || Repo.insert!(%Lipu.EnPartOfSpeech{name: pos}) end)

Enum.each(en_lemmas, fn (entry = %{text: text, pos: pos_name}) ->
  pos = Repo.get_by(Lipu.EnPartOfSpeech, name: pos_name)

  attrs =  %{
    text: text,
    pos_id: pos.id
  }

  Repo.get_by(Lipu.EnLemma, attrs)
    || Repo.insert!(struct(Lipu.EnLemma, attrs))
end)
