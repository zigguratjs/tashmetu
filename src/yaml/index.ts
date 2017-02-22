import {Provider} from '@samizdatjs/tiamat';
import {Serializer} from '@samizdatjs/tashmetu';
import {YamlSerializer} from './serializer';
import {YamlConfig} from './meta';
import * as _ from 'lodash';

const defaultOptions: YamlConfig = {
  frontMatter: false,
  indent: 2
};

export function yaml(config?: YamlConfig) {
  return (provider: Provider): Serializer => {
    return new YamlSerializer(_.merge({}, defaultOptions, config || {}));
  };
}
