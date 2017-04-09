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
  alternates: alternates
} = "priv/repo/wordList.csv"
  |> File.stream!
  |> CSV.parse_stream
  |> Enum.to_list
  |> BuildDictionary.build

Enum.each(tp_parts_of_speech, fn (pos) ->
  Repo.get_by(Lipu.TpPartOfSpeech, name: pos)
  || Repo.insert!(%Lipu.TpPartOfSpeech{name: pos}) end)

Enum.each(tp_lemmas, fn (x = %{text: text, pos: pos, animacy: animacy})
  ->
    # make attrs
    # build assoc with part of speech
    Repo.get_by(Lipu.TpLemma, x)
    || Repo.insert!(Lipu.TpLemma, )
  #     IO.puts(
  #   "#{text} #{pos} #{animacy} #{x[:primary] || "--"}"
  # )
end)

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
