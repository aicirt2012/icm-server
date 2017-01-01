/*
 * Syntax rules can be added below in the form of {name, rule, fn}, where fn is a function with params: taggedWords (one sentence), which is a 2-dim array [words][2] which contains speech tags for the words (lexigraphic information)
 */
export default {
  rules: [{
    name: 'MD + SUBJECT',
    rule: 'If a modal verb (auxiliary verb) is then first word of a sentence, this is an indication for a (task) request.',
    fn: function(taggedWords) {
      return taggedWords[0][1] == 'MD'; // 1st word is of type modal verb (MD)
    }
  }]
};

/* -------------------- TAGS (POSJS) https://github.com/neopunisher/pos-js --------------------
CC Coord Conjuncn           and,but,or
CD Cardinal number          one,two
DT Determiner               the,some
EX Existential there        there
FW Foreign Word             mon dieu
IN Preposition              of,in,by
JJ Adjective                big
JJR Adj., comparative       bigger
JJS Adj., superlative       biggest
LS List item marker         1,One
MD Modal                    can,should
NN Noun, sing. or mass      dog
NNP Proper noun, sing.      Edinburgh
NNPS Proper noun, plural    Smiths
NNS Noun, plural            dogs
POS Possessive ending       Õs
PDT Predeterminer           all, both
PP$ Possessive pronoun      my,oneÕs
PRP Personal pronoun         I,you,she
RB Adverb                   quickly
RBR Adverb, comparative     faster
RBS Adverb, superlative     fastest
RP Particle                 up,off
SYM Symbol                  +,%,&
TO ÒtoÓ                     to
UH Interjection             oh, oops
URL url                     http://www.google.com/
VB verb, base form          eat
VBD verb, past tense        ate
VBG verb, gerund            eating
VBN verb, past part         eaten
VBP Verb, present           eat
VBZ Verb, present           eats
WDT Wh-determiner           which,that
WP Wh pronoun               who,what
WP$ Possessive-Wh           whose
WRB Wh-adverb               how,where
, Comma                     ,
. Sent-final punct          . ! ?
: Mid-sent punct.           : ; Ñ
$ Dollar sign               $
# Pound sign                #
" quote                     "
( Left paren                (
) Right paren               )
-------------------- TAGS -------------------- */
