import React, { useEffect, useState } from "react";
const JishoApi = require("unofficial-jisho-api");
import { useRouter } from "next/router";
import { Box, Text, Tooltip } from "@chakra-ui/react";
import SearchBox from "../../components/SearchBox";
import { createUseStyles } from "react-jss";
import BackToTop from "../../components/BackToTop";
import { useTheme } from "@emotion/react";
import Container from "../../components/Container";
import { searchParameters } from "../../constants/dropdowns";
import OverlayModal from "../../components/OverlayModal";
import PageHeader from "../../components/PageHeader";

const useStyles = createUseStyles({
  imgWrapper: {
    padding: "32px",
    maxWidth: "500px",
    "@media screen and (max-width: 800px)": {
      maxWidth: "250px",
    },
  },
  wordWrap: {
    flex: "1",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    borderTop: (props) => `1px solid ${props.colors.primaryLight}`,
    padding: "16px 0",
    "@media screen and (max-width: 800px)": {
      padding: "16px",
    },
  },
  kanjiText: {
    fontSize: "32px",
    color: (props) => props.colors.primaryMedium,
  },
});

const WordSearch = (props) => {
  const theme = useTheme();
  const router = useRouter();
  const classes = useStyles(theme);
  const [words, setWords] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [noResults, setNoResults] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const WordText = () => {
    const convertArrayToSemiColonString = (array) => {
      var wordString = array.join("; ");
      return wordString;
    };

    const convertArrayToCommaString = (array) => {
      var wordString = array.join(", ");
      return wordString;
    };

    return (
      <>
        {words.map((word, index) => {
          return (
            <Box key={index}>
              <Box className={classes.wordWrap}>
                <Text className={classes.kanjiText}>{word.slug}</Text>
                <Text fontSize={["lg", "md"]} className={classes.hiraganaText}>
                  {word.japanese[0].reading}
                </Text>
                {/* <Text fontSize="sm">{word.jlpt[0]}</Text> */}
                {word.senses.map((sense, index) => (
                  <Box key={index} mt="16px">
                    <Text fontSize={["xs", "x-small"]}>
                      {convertArrayToCommaString(sense.parts_of_speech)}
                    </Text>
                    <Box display="flex">
                      <Text
                        fontSize={["md", "sm"]}
                        mr="8px"
                        color="GrayText"
                      >{`${index + 1}.`}</Text>
                      <Text fontSize={["md", "sm"]}>
                        {convertArrayToSemiColonString(
                          sense.english_definitions
                        )}
                      </Text>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}
      </>
    );
  };

  useEffect(async () => {
    if (props.words) {
      setWords(props.words);
      setNoResults(false);
    } else {
      setNoResults(true);
    }
  }, [isLoading]);

  useEffect(() => {
    setSearchValue(router.query.word);
    setIsLoading(false);
  }, [props.words]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchValue) {
      router.replace(`/search/${searchValue}`);
      setIsLoading(true);
    } else {
      setFiltered([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchValue(value);
  };

  return (
    <Container
      title=" Word Search - GOJISHO | Japanese word search for translations and verb conjugation"
      description="Search for Japanese word meanings, conjugations and example sentence"
    >
      <PageHeader
        title="WORD SEARCH"
        subtitle="[単語検索] たんごけんさく"
        description="Search for Japanese-English translations"
      />

      <form onSubmit={handleSearch}>
        <Box display="flex" flexDir="column" alignItems="center">
          <SearchBox
            handleChange={handleInputChange}
            options={[]}
            defaultSearch={searchParameters.ro}
            placeholder="English, Hiragana, Romaji, Kanji"
            value={searchValue}
            isLoading={isLoading}
          />
        </Box>
        <WordText />

        {noResults && (
          <Box p="16px">
            <Text fontSize="xs" color="grey">
              No search results found
            </Text>
            <Box display="flex">
              <Text fontSize="xs" color="grey">
                Please check for mispellings and try again.
              </Text>
            </Box>
          </Box>
        )}
      </form>
      <OverlayModal isOpen={modalOpen} handleToggle={setModalOpen} />
      <BackToTop show={words.length > 5} />
    </Container>
  );
};

export const getServerSideProps = async (context) => {
  const jisho = new JishoApi();
  const { word } = context.query;
  const response = await jisho.searchForPhrase(word.toLowerCase());
  var filteredData = [];
  if (response.data && response.data.length) {
    filteredData = response.data.filter((obj) => obj.attribution.jmdict);
  }

  return { props: { words: filteredData } };
};

export default WordSearch;
