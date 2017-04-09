defmodule Lipu.BuildDictionary do
  @accumulator %{
    tp_lemmas: MapSet.new,
    en_lemmas: MapSet.new,
    tp_parts_of_speech: MapSet.new,
    en_parts_of_speech: MapSet.new,
    alternates: MapSet.new,
    alternate_tp_lemmas: MapSet.new,
  }

  @semanticGroups "src/utils/tokiPonaSemanticGroups.json"
    |> File.read!
    |> Poison.Parser.parse!

  def get_animacy(text) do
    cond do
      (Enum.member?(@semanticGroups["ANIMATE_NOUNS"], text)
      || Enum.member?(@semanticGroups["ANIMATE_SUBJECT_VERBS"], text))
        -> true
      Enum.member?(@semanticGroups["INANIMATE_NOUNS"], text)
        -> false
      true
        -> nil
    end
  end

  def reduce([tp_text, "alt", primary], acc = %{alternates: alternates}) do
    %{acc | alternates: MapSet.put(alternates, {tp_text, primary})}
  end
  def reduce(
    [tp_text| [tp_pos | [en_pos | en_texts]]],
    acc = %{tp_lemmas: tp_ls, en_lemmas: en_ls, tp_parts_of_speech: tp_poss, en_parts_of_speech: en_poss}
  ) do
    tp_lemmas = MapSet.put(tp_ls, %{text: tp_text, pos: tp_pos, animacy: get_animacy(tp_text)})
    en_lemmas = Enum.concat(en_ls, Enum.map(en_ls, fn (en_text) -> %{text: en_text, pos: en_pos} end))
    %{acc |
      tp_lemmas: tp_lemmas,
      en_lemmas: en_lemmas,
      tp_parts_of_speech: MapSet.put(tp_poss, tp_pos),
      en_parts_of_speech: MapSet.put(en_poss, en_pos)
    }
  end

  def build(csv_list) do
    all = %{alternates: alternates, tp_lemmas: tp_lemmas_without_alternates, en_parts_of_speech: en_parts_of_speech} = Enum.reduce(csv_list, @accumulator, &Lipu.BuildDictionary.reduce/2)
    alternate_tp_lemmas = Enum.flat_map(alternates, fn({tp_text, primary}) ->
      tp_lemmas_without_alternates
        |> Enum.filter_map(
          fn(%{text: text}) -> text == primary end,
          fn(lemma) -> Map.put(%{lemma | text: tp_text}, :primary, primary) end
          )
    end)

    %{all
      | alternate_tp_lemmas: alternate_tp_lemmas,
      en_parts_of_speech: Enum.reject(en_parts_of_speech, &(String.starts_with?(&1, "x")))
    }
  end
end
